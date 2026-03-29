#this combines all the transcipts into one big file
import os

folder = r"C:\Users\Administrator\OneDrive\Documents\personal coding files\HTML-JS-CSS Projects\Website Project\Bill Scott Interview Recordings"

combined_output = os.path.join(folder, "FULL_TRANSCRIPT.txt")

with open(combined_output, "w", encoding="utf-8") as outfile:
    for filename in sorted(os.listdir(folder)):
        if filename.endswith(".txt"):
            outfile.write(f"\n\n--- {filename} ---\n\n")
            with open(os.path.join(folder, filename), "r", encoding="utf-8") as infile:
                outfile.write(infile.read())

print("Combined transcript saved as FULL_TRANSCRIPT.txt")