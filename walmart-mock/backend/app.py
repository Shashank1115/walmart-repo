from flask import Flask, request, jsonify
from flask_cors import CORS  # Add this
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration
import torch
import io
import base64

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

device = "cuda" if torch.cuda.is_available() else "cpu"
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base").to(device)

@app.route("/caption", methods=["POST"])
def generate_caption():
    try:
        data = request.json
        print("Received data:", data)

        image_data = data.get("image")
        if not image_data:
            return jsonify({"error": "No image data received"}), 400

        # Decode base64 image
        header, base64_data = image_data.split(",", 1)
        image_bytes = base64.b64decode(base64_data)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Run BLIP captioning
        inputs = processor(images=image, return_tensors="pt").to(device)
        out = model.generate(**inputs)
        caption = processor.decode(out[0], skip_special_tokens=True).strip()

        print("Generated caption:", caption)
        return jsonify({"caption": caption})

    except Exception as e:
        print("[Error] Caption generation failed:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5000)
