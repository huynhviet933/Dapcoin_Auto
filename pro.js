const axios = require('axios');
const bs58 = require('bs58').default;
const nacl = require('tweetnacl');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const { HttpsProxyAgent } = require('https-proxy-agent');
const colors = require('colors');

// ================= CẤU HÌNH TOOL =================
const THREADS = 20; 
const REQUEST_TIMEOUT = 30000; 
const SLEEP_BETWEEN_ACCOUNTS = [30000, 50000]; 

const readLines = (path) => fs.existsSync(path) ? fs.readFileSync(path, 'utf8').split(/\r?\n/).filter(line => line.trim() !== "") : [];
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// ---------------- LỚP XỬ LÝ BOT ----------------
class DapCoinBot {
    constructor(privateKey, proxy, userAgent, refCode, profile, walletIndex) {
        this.privateKey = privateKey;
        this.proxy = proxy;
        this.userAgent = userAgent;
        this.refCode = refCode; 
        this.profile = profile || {};
        this.walletIndex = walletIndex; 
        this.wallet = this.getWalletFromPK(privateKey);
        this.proxyAgent = proxy ? new HttpsProxyAgent(proxy) : null;
        
        this.token = this.profile.token || null;
        this.uuid = this.profile.uuid || uuidv4();
        
        this.proxyIP = proxy ? proxy.split('@').pop().split(':')[0] : 'No Proxy';
        this.myRefCode = "N/A"; 
    }

    shortAddr() {
        if (!this.wallet) return "Invalid";
        const addr = this.wallet.publicKey;
        return `${addr.slice(0, 6)}.......${addr.slice(-6)}`;
    }

    log(msg, type = 'success') {
        const prefix = `W ${this.walletIndex} | IP: ${this.proxyIP.cyan} | ${this.shortAddr().white} |`;
        if (type === 'success') console.log(`${prefix} ${msg.green}`);
        else if (type === 'warn') console.log(`${prefix} ${msg.yellow}`);
    }

    getWalletFromPK(pk) {
        try {
            const decoded = bs58.decode(pk);
            const keypair = nacl.sign.keyPair.fromSeed(decoded.slice(0, 32));
            return { publicKey: bs58.encode(keypair.publicKey), secretKey: keypair.secretKey };
        } catch (e) { return null; }
    }

    async request(method, url, data = null, useAuth = false) {
        const headers = {
            'accept': 'application/json, text/plain, */*',
            'content-type': 'application/json',
            'origin': 'https://airdrop.dapcoin.xyz',
            'referer': 'https://airdrop.dapcoin.xyz/',
            'user-agent': this.userAgent,
            'x-device-id': this.uuid
        };
        if (useAuth && this.token) headers['authorization'] = `Bearer ${this.token}`;

        try {
            const res = await axios({ method, url, data, headers, httpsAgent: this.proxyAgent, timeout: REQUEST_TIMEOUT });
            return { success: true, data: res.data };
        } catch (e) { return { success: false, error: e.message }; }
    }

    async login() {
        const res = await this.request('POST', 'https://gateway.dapcoin.xyz/api/auth/login', {
            wallet_address: this.wallet.publicKey,
            ref: this.refCode, email: null, username: null
        });
        if (!res.success) return false;

        let token = res.data?.token;
        if (!token && res.data?.nonce) {
            const signature = nacl.sign.detached(Buffer.from(res.data.nonce), this.wallet.secretKey);
            const verifyRes = await this.request('POST', 'https://gateway.dapcoin.xyz/api/auth/verify', {
                signature: Buffer.from(signature).toString('base64'), 
                wallet_address: this.wallet.publicKey
            });
            if (verifyRes.success) token = verifyRes.data.token;
        }

        if (token) {
            this.token = token;
            this.log(`Login successful (Ref: ${this.refCode})`, 'success');
            return true;
        }
        return false;
    }

    async checkIn() {
        const res = await this.request('POST', 'https://gateway.dapcoin.xyz/api/checkin', {}, true);
        if (res.success) this.log(`Check in successful +${res.data.points_awarded} Points`, 'success');
        else this.log(`Check in: Already checked or Error`, 'warn');
    }

    async doTasks() {
        const types = ['DAILY', 'ONCE'];
        for (const type of types) {
            const res = await this.request('GET', `https://gateway.dapcoin.xyz/api/tasks?limit=100&frequency=${type}`, null, true);
            if (res.success && res.data?.data) {
                for (const task of res.data.data) {
                    if (task.user_completion === null) {
                        const completeRes = await this.request('POST', `https://gateway.dapcoin.xyz/api/tasks/${task.id}/complete`, {}, true);
                        if (completeRes.success) this.log(`${task.title} +${task.points} Points`, 'success');
                        await sleep(1000);
                    }
                }
            }
        }
    }

    async getInfo() {
        const res = await this.request('GET', 'https://gateway.dapcoin.xyz/api/me', null, true);
        if (res.success) {
            if (res.data.referral_code) {
                this.myRefCode = res.data.referral_code;
                fs.appendFileSync('uref.txt', `${this.myRefCode}\n`);
            }
            return res.data.points;
        }
        return 0;
    }
}

async function main() {
    const keys = readLines('privatekey.txt');
    const uas = readLines('user_agents.txt');
    const refs = readLines('ref.txt');
    const proxyList = readLines('proxy.txt');
    const rootRef = refs[0] || "MVOZWJH2";

    let queue = keys.map((pk, index) => ({ pk, id: index + 1 }));
    let profiles = fs.existsSync('profiles.json') ? fs.readJsonSync('profiles.json') : [];

    console.log(`[Hệ thống] Bắt đầu chạy ${keys.length} ví...`.yellow);

    const worker = async () => {
        while (queue.length > 0) {
            const item = queue.shift();
            const { pk, id } = item;
            let bot = null;
            let isLogged = false;

            let profileIndex = profiles.findIndex(p => p.pk === pk);
            let existingProfile = profiles[profileIndex] || {};

            for (let i = 0; i < 3; i++) {
                const proxy = proxyList.length > 0 ? proxyList[Math.floor(Math.random() * proxyList.length)] : null;
                const ua = existingProfile.ua || uas[Math.floor(Math.random() * uas.length)] || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
                
                bot = new DapCoinBot(pk, proxy, ua, rootRef, existingProfile, id);
                
                if (await bot.login()) { 
                    isLogged = true; 
                    
                    const updatedData = { 
                        pk, 
                        address: bot.wallet.publicKey, 
                        token: bot.token, 
                        uuid: bot.uuid, 
                        ua: bot.userAgent 
                    };
                    if (profileIndex !== -1) profiles[profileIndex] = updatedData;
                    else profiles.push(updatedData);
                    
                    fs.writeJsonSync('profiles.json', profiles, { spaces: 2 });
                    break; 
                }
            }

            if (isLogged) {
                await bot.checkIn();
                await bot.doTasks();
                const total = await bot.getInfo();
                const delay = getRandom(...SLEEP_BETWEEN_ACCOUNTS);
                bot.log(`Total: ${total} Points | My Ref: ${bot.myRefCode} | ${Math.floor(delay/1000)}s Delay.....`, 'success');
                await sleep(delay);
            }
        }
    };

    const threadPromises = [];
    for (let i = 0; i < Math.min(THREADS, keys.length); i++) {
        threadPromises.push(worker());
        await sleep(2000);
    }
    await Promise.all(threadPromises);
    console.log("XỬ LÝ HOÀN TẤT TẤT CẢ TÀI KHOẢN!".rainbow);
}

main();