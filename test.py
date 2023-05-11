import os
import os.path
import win32api
import time

def getFileName(rootdir):
    file = []
    for parent, dirnames, filenames in os.walk(rootdir):
        for f in filenames:
            file.append([parent, f])
    return file

def getFileVersion(file_name):
    info = win32api.GetFileVersionInfo(file_name, os.sep)
    ms = info['FileVersionMS']
    ls = info['FileVersionLS']
    version = '%d.%d.%d.%04d' % (win32api.HIWORD(ms), win32api.LOWORD(ms), win32api.HIWORD(ls), win32api.LOWORD(ls))
    return version

getFileTime = lambda file: time.ctime(os.stat(file).st_mtime)

#print getFileTime('d:/rizhi/12yue/ex121013.log')

res = {}
rootdir = 'C:/Program Files/Integem iCreator'
file = getFileName(rootdir)

for n in file:
    filePath = (n[0] + '/' + n[1]).replace('\\', '/')
    try:
        version = getFileVersion(filePath)
    except:
        modiTime = getFileTime(filePath)
        res[filePath] = modiTime
    else:
        res[filePath] = version

print res
