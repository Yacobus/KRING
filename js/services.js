angular.module('kring.services', [])
.factory("$cipherFactory", function () {

    return {

        encrypt: function (message, password) {
            var salt = forge.random.getBytesSync(128);
            var key = forge.pkcs5.pbkdf2(password, salt, 4, 16);
            var iv = forge.random.getBytesSync(16);
            var cipher = forge.cipher.createCipher('AES-CBC', key);
            cipher.start({ iv: iv });
            cipher.update(forge.util.createBuffer(message));
            cipher.finish();
            var cipherText = forge.util.encode64(cipher.output.getBytes());
            return { cipher_text: cipherText, salt: forge.util.encode64(salt), iv: forge.util.encode64(iv) };
        },

        decrypt: function (cipherText, password, salt, iv, options) {
            var key = forge.pkcs5.pbkdf2(password, forge.util.decode64(salt), 4, 16);
            var decipher = forge.cipher.createDecipher('AES-CBC', key);
            decipher.start({ iv: forge.util.decode64(iv) });
            decipher.update(forge.util.createBuffer(forge.util.decode64(cipherText)));
            decipher.finish();
            if (options !== undefined && options.hasOwnProperty("output") && options.output === "hex") {
                return decipher.output.toHex();
            } else {
                return decipher.output.toString();
            }
        }

    };

});