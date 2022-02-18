import cv2
import mediapipe as mp
import time
import random
import math

SPAWN_INTERVAL = 2 # seconds

objects = []
speed = 10

cap = cv2.VideoCapture(0)

mpHands = mp.solutions.hands
hands = mpHands.Hands()

pTime = time.time()

while True:
    success, img = cap.read()
    img = cv2.flip(img, 1)
    imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = hands.process(imgRGB)

    h, w, c = img.shape

    if results.multi_hand_landmarks:
        for handLms in results.multi_hand_landmarks:
            p1 = (int(handLms.landmark[0].x * w), int(handLms.landmark[0].y * h))
            p2 = (int(handLms.landmark[5].x * w), int(handLms.landmark[5].y * h))
            p3 = (int(handLms.landmark[17].x * w), int(handLms.landmark[17].y * h))
            
            cent = (int((p1[0] + p2[0] + p3[0])/3), int((p1[1] + p2[1] + p3[1])/3))
            cv2.circle(img, cent, 30, (0, 255, 0), cv2.FILLED, 2)

    for obj in objects:
        cv2.circle(img, obj[0], 5, (0,0,255), 2)
        obj[0] = (int(obj[0][0] + obj[1][0]*speed), int(obj[0][1] + obj[1][1]*speed))
        # delete balls

    cTime = time.time()
    if(cTime - pTime > SPAWN_INTERVAL):
        pTime = cTime

        yVel = random.uniform(-1,1) * h / math.hypot(w,h)
        
        xVel = math.sqrt(1 - yVel*yVel)
        sign = random.random() - 0.5
        if(sign > 0):
            xVel = xVel
        else:
            xVel = -xVel

        if(xVel < 0):
            xPos = w
        else:
            xPos = 0

        if(yVel < 0):
            yPos = h
        else:
            yPos = 0
        
        objects.append([(xPos, yPos), (xVel, yVel)])

    cv2.imshow("Image", img)
    k = cv2.waitKey(1) & 0xFF
    if k == 27:    # Use Esc key to exit the program
        break
