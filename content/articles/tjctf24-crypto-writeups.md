---
title: "TJCTF24 Crypto Writeups"
date: "2024-05-20T18:59:37-07:00"
minutes: 5
---

- [Weird-Crypto [151 solves, 118 points]](/posts/tjctf24-crypto-writeups/#weird-crypto-151-solves-118-points)
- [Hulksmash [23 solves, 229 points]](/posts/tjctf24-crypto-writeups/#hulksmash-23-solves-229-points)

This past weekend, I competed in TJ CTF 2024 with my friends at Slith3r. It was a pretty fun CTF although I wasn’t able to spend the full time focused on the competition. I’m just going to be writing about 2 of the Crypto challenges and the overall thought process when solving them.

# Weird-Crypto [151 solves, 118 points] {#weird-crypto-151-solves-118-points}

Here’s the given source code

```
from math import lcm
from Crypto.Util.number import bytes_to_long, getPrime

with open('flag.txt', 'rb') as f:
    flag = bytes_to_long(f.read().strip())

oops = getPrime(20)
p1 = getPrime(512)
p2 = getPrime(512)

haha = (p1-1)*(p2-1)
crazy_number = pow(oops, -1, haha)
discord_mod = p1 * p2
hehe_secret = pow(flag, crazy_number, discord_mod)

print('admin =', discord_mod)
print('hehe_secret =', hehe_secret)
print('crazy number =', crazy_number)
```

From the get go, it seems like a RSA challenge. The various “keywords” can make it a little confusing to understand at first. When I first approached this challenge, I decided to start by annotating the file. That is, I changed back terms into their “typical” representation. For example, haha became phi, oops became e …

Hopefully it’s obvious by now, but the implementation of RSA is off here. Specifically on line 12, it calculates crazy number by taking the modular multiplicative inverse of e modulo Euler’s totient function. This gives us d, the private key. The flag is then encrypted to hehe\_secret by raising it to the power of the ciphertext and modding n. But since flag is being raised to crazy\_number, it’s really being decrypted rather than being encrypted. As such when we’re trying to solve the challenge, we should try to “encrypt” the ciphertext. Another way to think about it is that we’re given the plaintext, but we want to find the ciphertext. I don’t think this has a big impact on the result or approach of the challenge, but it was an important thing I felt should be pointed out.

The second thing to note is that oops calls getPrime(20). Normally when doing RSA challenges, getPrime is called with 512 as it’s parameter. getPrime(512) will return a prime number of 512 bits in length. This is basically brute-force proof.

*[Irrelevant tangent, but for getPrime(512), there’s approximately 52579638940951361174800098032179788735213199296440758344013966445967702078719792065889703130066287951725615130143082552367662285537045372338955486298369 possible prime numbers. For getPrime(20), there’s only about 75,500 possible prime numbers. Granted, that is a lot, but as you can see, it’s orders of magnitude smaller]*

*In case you were curious, the prime number estimations are based on the prime number theorem, which states that approximately 1/ln(2^x) numbers will be prime. Multiply that by 2^x for the total amount of numbers we’re searching give us the two values.*

Anyways, getPrime(20) looks suspicious and sure enough, since we’re trying to encrypt, we need to find e. Fortunately, we know that e was generated through getPrime(20). That gives us 2^20 possible values for e (technically less, but I was also lazy to check for only primes). Even then that only gives us 1048576 possible values, which is definitely bruteable.

Our logic is pretty simple, we check various possible values of e and use it in the RSA encryption function (pow(crazy\_number, e, discord\_mod)). We then check the byte values and see if it contains the start of the flag (“tjctf”). If it does, we break from the script.

Here’s my solution:

```
from Crypto.Util.number import *
n = 115527789319991047725489235818351464993028412126352156293595566838475726455437233607597045733180526729630017323042204168151655259688176759042620103271351321127634573342826484117943690874998234854277777879701926505719709998116539185109829000375668558097546635835117245793477957255328281531908482325475746699343
ciphertext = 10313360406806945962061388121732889879091144213622952631652830033549291457030908324247366447011281314834409468891636010186191788524395655522444948812334378330639344393086914411546459948482739784715070573110933928620269265241132766601148217497662982624793148613258672770168115838494270549212058890534015048102

for i in range (2**20):
    sol = long_to_bytes(pow(ciphertext,i,n))
    if b"tjctf" in sol:
        print(sol)

# b'tjctf{congrats_on_rsa_e_djfkel2349!}'
```

# Hulksmash [23 solves, 229 points] {#hulksmash-23-solves-229-points}

“my friends password is keysmash…. :(… i got some of his old keysmashes tho…. he types kinda funny….”

We’re given the following files. The file used to encrypt the flag:

```
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

key = open("key.txt", "rb").read().strip()
flag = pad(open("flag.txt", "rb").read(), 16)
cipher = AES.new(key, AES.MODE_ECB)
open("output.txt", "w+").write(cipher.encrypt(flag).hex())
```

For some quick analysis on the file itself. The program is pretty simple. It opens a file called key.txt and reads in a key. It then opens the flag, and pads it to a multiple of 16 bytes. From there, it takes the key, creates an AES cipher in ECB mode and encrypts the flag using that key. The encrypted flag is then given to us in output.txt.

We’re also given 2 other files, keysmashes and output.txt. Keysmashes.txt:

```
fjdlska;sjfldka;
fldjs;akdka;flsj
d;flskajdlajf;sk
skflajd;a;djfksl
akd;sjflfja;dksl
flskd;ajs;fkajdl
fkald;sjaksldjf;
skd;ajflflajs;dk
fjs;dlakfkajd;sl
akfjdls;sldka;fj
fldjska;ajfkdls;
fjska;dla;slfjdk
s;fldjakdjfksla;
a;dkslfjdja;flsk
akf;djsldlf;skaj
sldjakf;a;fldksj
dlfka;sjskaldjf;
ska;djfls;akfldj
```

Output.txt:

```
ed05f1440f3ae5309a3125a91dfb0edef306e1a64d1c5f7d8cea88cdb7a0d7d66bb36860082a291138b48c5a6344c1ab
```

The challenge description helps give a good idea as to where to start. “my friends password is keysmash”. From here, we can safely assume that the key that is being read in is one of this friend’s “passwords”. The keysmashes.txt helps give us some patterns that we can recognize. For starters, the only characters used are from the home row. This significantly narrows down the possible keys. The next thing to realize is that each alternating character comes from a different side. That is to say, the first character comes from keys that could be pressed by the left hand the second character comes from keys that could be pressed by the right hand. The third from the left and so on and so forth. For each position, there’s 4 possibilities as to what it can be. The key happens to be 16 characters long. From here, we can do a little brute force to see which key will give us a flag that starts with “tjctf{”. Here’s the actual solve script (written by NootKroot)

```
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
from tqdm import tqdm
from itertools import permutations, chain

l = "asdf"
r = "jkl;"
output = open("output.txt", 'r').read()
output_data = bytes.fromhex(output)
def brute():
    with tqdm(total=242424*24) as pbar:
        for i in permutations(list(range(4))):
            for j in permutations(list(range(4))):
                g1 = l[i[0]]+r[j[0]]+l[i[1]]+r[j[1]]+l[i[2]]+r[j[2]]+l[i[3]]+r[j[3]]
                for x in permutations(list(range(4))):
                    for y in permutations(list(range(4))):
                        g2 = l[x[0]]+r[y[0]]+l[x[1]]+r[y[1]]+l[x[2]]+r[y[2]]+l[x[3]]+r[y[3]]
                        guess = g1+g2

                        cipher = AES.new(guess.encode(), AES.MODE_ECB)
                        pt = cipher.decrypt(output_data)
                        if pt.startswith(b"tjctf"):
                            print("FLAG FOUND!!!!!!!")
                            print(unpad(pt, 16))
                            return
                        pbar.update(1)
```
