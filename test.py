import speech_recognition as sr  # 语音识别库
import pyautogui           # 电脑控制库

r = sr.Recognizer()        # 初始化语音识别器

while True:                 # 循环获取语音输入并作出响应
    with sr.Microphone() as source:    # 使用麦克风 as 来源
        print("Say something!")       # 提示用户说话
        audio = r.listen(source)      # 等待并获取音频数据

    try:
        text = r.recognize_google(audio)    # 使用谷歌语音识别服务识别语音
        print("You said: {}".format(text)) # 打印出用户说的话
        
        if "open browser" in text.lower(): # 如果文本中包含打开浏览器
            pyautogui.click()             # 单击鼠标打开浏览器
            pyautogui.hotkey('ctrl', 'esc')   
            
        elif "close browser" in text.lower():# 如果包含关闭浏览器
            pyautogui.hotkey('alt', 'f4')      # 按alt+f4关闭浏览器  
            
    except sr.UnknownValueError:      # 如果无法识别语音
        print("Oops! Didn't catch that.")