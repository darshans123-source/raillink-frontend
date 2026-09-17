"""Generates a professional logo for AI-RailLink in assets/logo.png."""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

os.makedirs("assets", exist_ok=True)
width, height = 512, 512

# Create transparent image
img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Deep green background circle with border
draw.ellipse([24, 24, 488, 488], fill=(27, 67, 50, 255), outline=(82, 183, 136, 255), width=10)

# Inner soft ring
draw.ellipse([44, 44, 468, 468], outline=(45, 106, 79, 180), width=4)

# Streamlined High-Speed Train Front Silhouette (aerodynamic nose)
# Coordinates for aerodynamic bullet train nose
train_points = [
    (140, 310), (140, 210), (200, 160), (312, 160), (372, 210), (372, 310),
    (340, 340), (172, 340)
]
draw.polygon(train_points, fill=(255, 255, 255, 255))

# Train Windshield (Aerodynamic visor)
windshield_points = [
    (170, 210), (210, 180), (302, 180), (342, 210),
    (320, 235), (192, 235)
]
draw.polygon(windshield_points, fill=(45, 106, 79, 255))

# Headlights
draw.ellipse([180, 290, 210, 315], fill=(245, 158, 11, 255))  # Amber left headlight
draw.ellipse([302, 290, 332, 315], fill=(245, 158, 11, 255))  # Amber right headlight

# Center high-beam
draw.ellipse([244, 275, 268, 295], fill=(255, 255, 255, 255))

# Radio / Wireless Transmission Arcs (Antenna signal waves above train)
# Arc 1
draw.arc([216, 85, 296, 165], start=210, end=330, fill=(116, 198, 157, 255), width=8)
# Arc 2
draw.arc([186, 55, 326, 195], start=210, end=330, fill=(82, 183, 136, 255), width=8)
# Arc 3
draw.arc([156, 25, 356, 225], start=210, end=330, fill=(45, 106, 79, 255), width=8)

# Center antenna transmitter node
draw.ellipse([250, 140, 262, 152], fill=(245, 158, 11, 255))

# Railway Track Rails at bottom
draw.line([(100, 390), (412, 390)], fill=(183, 228, 199, 255), width=10)
# Sleepers
for x in range(120, 400, 32):
    draw.line([(x, 382), (x, 398)], fill=(255, 255, 255, 220), width=5)

# Save image
img.save("assets/logo.png", "PNG")
print("Saved assets/logo.png successfully")
