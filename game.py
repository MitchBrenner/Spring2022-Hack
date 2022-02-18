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
            x1, x2 = int(lm.x * w), int(lm.y * h)
            for id, lm in enumerate(handLms.landmark):
                h, w, c = img.shape
                p1 = (int(handLms.landmark[0].x * w), int(handLms.landmark[0].y * h))
                p2 = (int(handLms.landmark[5].x * w), int(handLms.landmark[5].y * h))
                p3 = (int(handLms.landmark[17].x * w), int(handLms.landmark[17].y * h))
                cv2.circle(img, p1, 10, (255, 0, 0), 2)
                cv2.circle(img, p2, 10, (255, 0, 0), 2)
                cv2.circle(img, p3, 10, (255, 0, 0), 2)

    cv2.imshow("Image", img)
    k = cv2.waitKey(1) & 0xFF
    if k == 27:    # Use Esc key to exit the program
        break
