var eccEncryptTest = async function() {


    const ecdh1 = crypto.createECDH('secp256k1');

    // 0 - Having a private ECDSA key
    var privateKey1 = crypto.randomBytes(32);
    console.log(`Private key-1:[${privateKey1.toString(`hex`)}]`);

    // 1 - Take the corresponding public key generated with it (33 bytes, 1 byte 0x02 (y-coord is even),
    // and 32 bytes corresponding to X coordinate)
    ecdh1.setPrivateKey(privateKey1);
    var publicKey1 = Buffer.from(ecdh1.getPublicKey('hex', 'compressed'), 'hex');
    var publicKeyUn = Buffer.from(ecdh1.getPublicKey('hex', 'uncompressed'), 'hex');
    console.log(`Public key-1:[${publicKeyUn.toString(`hex`)}]`);

    var msg = '334dd1fdf10ae8dc29e1d2e46309a8700b95cc103bad30c246901be4a4f9e130';

    //msg =  Buffer.from(msg,'hex');

    var eccem = await eccEncrypt(publicKey1,msg);

    console.log("eccEncWhole=" + eccem);

}

var eccEncrypt = async function secp256k1Encrypt(publicKey, data) {

    var ecdh = crypto.createECDH('secp256k1');

    var rbPriv = crypto.randomBytes(32);
    console.log("rbpriv=" + rbPriv.toString('hex'))
    ecdh.setPrivateKey(rbPriv);
    var rbpub = Buffer.from(ecdh.getPublicKey('hex', 'compressed'), 'hex');
    console.log("rbpub=" + rbpub.toString('hex'))
    var rbpubun = Buffer.from(ecdh.getPublicKey('hex', 'uncompressed'), 'hex');
    console.log("rbpubuncom=" + rbpubun.toString('hex'))

    var shared = ecdh.computeSecret(publicKey, null, 'hex');
    console.log("sharedKey=" + shared.toString('hex'))

    var derivedKey = crypto.pbkdf2Sync(shared,' ',2, 64, 'sha256');
    console.log("derivedKey=" + derivedKey.toString('hex'))

    var encKey = derivedKey.slice(0,16)
    console.log("encKey=" + encKey.toString('hex'))

    var macKey = derivedKey.slice(16,32)
    console.log("macKey=" + macKey.toString('hex'))

    var keyHash = crypto.createHash('sha256');
    macKey = keyHash.update(macKey).digest();
    console.log("hashmacKey=" + macKey.toString('hex'))

    var iv = crypto.randomBytes(16);
    console.log("iv=" + iv.toString('hex'))

    var em = aesencrypt(encKey,iv,data);
    console.log("encryptedMsg=" + em.toString('hex'))

    let hmac = crypto.createHmac('sha256', macKey);
    hmac.update(em,'hex');
    var mac = hmac.digest();
    console.log("mac=" + mac.toString('hex'))


    var res = rbpubun.toString('hex');
    res += iv.toString('hex');
    res += em.toString('hex');
    res += mac.toString('hex');

    return res;

}



var aesencrypt = function (key, iv, data) {
    var cipher = crypto.createCipheriv('aes-128-cbc',key, iv);
    var crypted = cipher.update(data,'hex','hex');
    crypted += cipher.final('hex');
    crypted = Buffer.from(crypted, 'hex').toString('hex');
    return crypted;
};



var asedecrypt = function (key, iv, crypted) {
    crypted = Buffer.from(crypted, 'base64').toString('binary');
    var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    var decoded = decipher.update(crypted, 'binary', 'utf8');
    decoded += decipher.final('utf8');
    return decoded;
};



async function main() {
   // await testCrypto();
    await eccEncryptTest();

}

main()