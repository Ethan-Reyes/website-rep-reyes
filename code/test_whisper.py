#this file is just to test if the transcipt software works; it does
import whisper

model = whisper.load_model("small")
print("Whisper loaded successfully!")