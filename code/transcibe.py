#this file transcribes all the interview videos and makes them into text
import whisper
import os

model = whisper.load_model("small")

folder = r"C:\Users\Administrator\OneDrive\Documents\personal coding files\coding projects\Website Project\code\audio"

for filename in os.listdir(folder):
    if filename.endswith(".mp3"):
        filepath = os.path.join(folder, filename)
        print(f"Transcribing {filename}...")
        result = model.transcribe(filepath)
        
        output_path = os.path.join(folder, filename.replace(".mp3", ".txt"))
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(result["text"])
        
        print(f"Saved: {output_path}")

print("All done!")