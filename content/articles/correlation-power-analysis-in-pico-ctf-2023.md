---
title: "Correlation Power Analysis in PicoCTF 2023"
date: "2023-06-26T19:57:03-07:00"
minutes: 4
---

Table of Contents

- [Introduction](/posts/correlation-power-analysis-in-pico-ctf-2023/#introduction)
- [Solving the Challenge](/posts/correlation-power-analysis-in-pico-ctf-2023/#solving-the-challenge)
- [Additional Thoughts](/posts/correlation-power-analysis-in-pico-ctf-2023/#additional-thoughts)
- [Conclusion](/posts/correlation-power-analysis-in-pico-ctf-2023/#conclusion)

# Introduction {#introduction}

The hardest and also most interesting cryptography challenge of PicoCTF 2023 involved undoing AES using a side channel attack, specifically power analysis.

If I’m going to be honest, it was a pretty big surprise to see a side channel attack be the primary challenge within Pico but it was definitely a fun experience.

# Solving the Challenge {#solving-the-challenge}

The core idea of correlation power analysis (CPA) is to take the non-linear part of AES, the S-box lookup and use that bit of info to extract more information about the key.

In this writeup, I’m going to explain the process for solving power analysis 2 as the code and logic can be applied to power analysis 1 and warmup.

In AES’s operation, the key is first Xor-ed with the plain text, the result is then searched up in a S-box for substitution. The power analysis attack relies on the fact that the hamming weight (the number of ones within any binary number) can be correlated with the power consumption of a device which allows us to find the key.

Since we’re given the specific power traces, we can run through various iterations of potential keys and see which keys when Xor-ed with the given plain text would generate the described power traces.

From there it just becomes a matter of letting the program run until a key is generated that has a positive correlation with the power traces.

Here’s the main resource my team and I used to first tackle this problem.
<https://teamrocketist.github.io/2018/11/14/Crypto-SquareCtf-2018-C4-leaky-power/>

This ended up being our team’s solve script (written by Nullawe)

```
import numpy as np
import random, sys, time

HW = [bin(n).count("1") for n in range(0,256)]

sbox=(
0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16)

def intermediate(pt, keyguess):
    return sbox[pt ^ keyguess]

traces = []
pt = []

for i in range(100):
    s = str(i)
    f = open("trace" + s + ".txt", "r")
    pt.append(bytes.fromhex(f.readline()))
    arr = []
    strs = f.readline()[81:-2].split(", ")
    for num in strs:
        arr.append(int(num))
    traces.append(arr)
    f.close()

print(len(traces[0]))
print(len(pt[0]))

bestguess = []
if bestguess == []:

    numtraces = np.shape(traces)[0]-1
    numpoint = np.shape(traces)[1]

    bestguess = [0]*16
    
    for bnum in range(0, 16):
        print("here bnum = " + str(bnum))
        cpaoutput = [0]*256
        maxcpa = [0]*256
        for kguess in range(0, 256):
            if (kguess % 10 == 0):
                print("here kguess = " + str(kguess))
            #Initialize arrays & variables to zero
            sumnum = np.zeros(numpoint)
            sumden1 = np.zeros(numpoint)
            sumden2 = np.zeros(numpoint)

            hyp = np.zeros(numtraces)
            for tnum in range(0, numtraces):
                hyp[tnum] = HW[intermediate(pt[tnum][bnum], kguess)]


            #Mean of hypothesis
            meanh = np.mean(hyp, dtype=np.float64)

            #Mean of all points in trace
            meant = np.mean(traces, axis=0, dtype=np.float64)

            #For each trace, do the following
            for tnum in range(0, numtraces):
                hdiff = (hyp[tnum] - meanh)
                tdiff = traces[tnum] - meant

                sumnum = sumnum + (hdiff*tdiff)
                sumden1 = sumden1 + hdiff*hdiff 
                sumden2 = sumden2 + tdiff*tdiff

            cpaoutput[kguess] = sumnum / np.sqrt( sumden1 * sumden2 )
            maxcpa[kguess] = max(abs(cpaoutput[kguess]))


        bestguess[bnum] = np.argmax(maxcpa)

    key = ''
    for b in bestguess: 
        key += "%02x"%b
```

# Additional Thoughts {#additional-thoughts}

I feel it’s important to note that correlation power analysis doesn’t work in most circumstances. Looking at the power traces only works if and only if the device preforming encryption isn’t doing anything else. For example if the device was like your typical computer which was also doing calculations, those other actions would also influence the power consumption, rendering the power traces un-usable.

Compared to other challenges, CPA didn’t have the most existing documentation, but of the resources that existed, they were quite helpful. In my opinion, a little too helpful. We were able to solve the challenge by using existing scripts and briefly changing the input method to follow Pico’s format. I do feel that the 300, 400 and 500 point challenges in pico shouldn’t be that simple to solve, especially with challenges like msfrog and cancri-sp.

# Conclusion {#conclusion}

Overall a fun and very interesting challenge to see. I’m glad it wasn’t too mathy like many complex cryptography challenges tend to devolve into.

Thanks for reading and I hope you found something interesting.
