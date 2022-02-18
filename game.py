import cv2
import mediapipe as mp
import time

cap = cv2.VideoCapture(0)

mpHands = mp.solutions.hands
hands = mpHands.Hands()

while True:
    success, img = cap.read()
    imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = hands.process(imgRGB)

    if results.multi_hand_landmarks:
        for handLms in results.multi_hand_landmarks:
            h, w, c = img.shape
            p1 = (int(handLms.landmark[0].x * w), int(handLms.landmark[0].y * h))
            p2 = (int(handLms.landmark[5].x * w), int(handLms.landmark[5].y * h))
            p3 = (int(handLms.landmark[17].x * w), int(handLms.landmark[17].y * h))
            
            cent = (int((p1[0] + p2[0] + p3[0])/3), int((p1[1] + p2[1] + p3[1])/3))

            cv2.circle(img, cent, 30, (255, 0, 0), cv2.FILLED, 2)

    cv2.imshow("Image", img)
    k = cv2.waitKey(1) & 0xFF
    if k == 27:    # Use Esc key to exit the program
        break
