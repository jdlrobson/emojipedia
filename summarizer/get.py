import wikiarticle
import sys
import random

summaries = wikiarticle.get_summaries(sys.argv[1])

def printRandom(summaries):
    choice = random.choice(summaries)
    if 'summary' in choice and len(choice['summary']) and choice['summary'][0]:
        print(choice['summary'][0])
    else:
        printRandom(summaries)

def mapit(summary):
    try:
       return summary['summary'][0]
    except IndexError:
        return ''

printRandom(summaries)
'''
items = map(mapit, summaries)
for item in items:
    if item:
        print(item)
'''