import whisper
import os

model = whisper.load_model("small")

# Dynamic path logic: Find the 'audio' folder inside the 'code' folder
base_dir = os.path.dirname(os.path.abspath(__file__))
folder = os.path.join(base_dir, 'audio')

print(f"Targeting active recordings in: {folder}")

# Ensure the folder exists before trying to list it
if not os.path.exists(folder):
    print(f"Error: The folder {folder} does not exist. Check your folder structure!")
else:
    for filename in sorted(os.listdir(folder)):
        if filename.endswith((".mp3", ".m4a")):
            base_name = os.path.splitext(filename)[0]
            output_path = os.path.join(folder, f"{base_name}.txt")

            # Skip if we already have the transcript to save time
            if os.path.exists(output_path):
                print(f"Skipping {filename}, transcript already exists.")
                continue

            filepath = os.path.join(folder, filename)
            print(f"Transcribing NEW file: {filename}...")
            result = model.transcribe(filepath)
            
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(result["text"])
            
            print(f"Saved: {output_path}")

print("Transcription phase complete!")