#!/usr/bin/env python

from glob import glob
import numpy as np 
import json
from astropy.time import Time

path = "./xyz/pulses4viz/"
particles = glob(path + "particle_bronze*.json") + glob(path + "particle_gold*.json")

times = []
files = []

for part in particles:
    with open(part) as f:
        data = json.load(f)
    times.append(Time(data['time']).mjd)

    
sortedList = np.array(particles)[np.argsort(times)[::-1]]
    
outfile = open(path + "fileList.json", "w")

outfile.write("{\n \"fileList\": [\n")
    
for i in np.arange(len(sortedList)):
    sep = ","
    
    if i == len(sortedList) - 1:
        sep = ""
    
    outfile.write("\t\"" + sortedList[i] + "\"" + sep + "\n")   
    
outfile.write("\t]\n}\n");
outfile.close();



