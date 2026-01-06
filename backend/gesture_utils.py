# Gesture utility
def is_pinch(landmarks, threshold=0.05):
    thumb = landmarks[4]
    index = landmarks[8]
    dist = ((thumb.x - index.x)**2 + (thumb.y - index.y)**2) ** 0.5
    return dist < threshold

def is_fist(landmarks, threshold=0.1):
    palm = landmarks[0]
    tips = [landmarks[i] for i in [4, 8, 12, 16, 20]]
    dists = [((t.x - palm.x)**2 + (t.y - palm.y)**2)**0.5 for t in tips]
    return all(d < threshold for d in dists)
