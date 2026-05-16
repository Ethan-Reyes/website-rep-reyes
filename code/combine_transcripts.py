import os

# Dynamic path logic: Look inside the 'audio' folder
base_dir = os.path.dirname(os.path.abspath(__file__))
folder = os.path.join(base_dir, 'audio')

combined_output = os.path.join(folder, "FULL_TRANSCRIPT.txt")

if not os.path.exists(folder):
    print(f"Error: Cannot find the folder at {folder}")
else:
    print(f"Combining files in: {folder}")
    with open(combined_output, "w", encoding="utf-8") as outfile:
        for filename in sorted(os.listdir(folder)):
            # Combine all .txt files except the final output file itself
            if filename.endswith(".txt") and filename != "FULL_TRANSCRIPT.txt":
                outfile.write(f"\n\n--- {filename} ---\n\n")
                with open(os.path.join(folder, filename), "r", encoding="utf-8") as infile:
                    outfile.write(infile.read())

    print(f"Combined transcript saved to: {combined_output}")