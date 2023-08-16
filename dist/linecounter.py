import os

def count_lines_in_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        return sum(1 for line in file)

def count_lines_in_directory(directory_path):
    total_lines = 0
    for root, _, files in os.walk(directory_path):
        
        if "stockfish.js" in files:
            continue
        print(files)
        for file in files:
            file_path = os.path.join(root, file)
            total_lines += count_lines_in_file(file_path)
    return total_lines

if __name__ == "__main__":
    current_directory = os.getcwd()
    total_lines = count_lines_in_directory(current_directory)
    print(f"Total lines in all files: {total_lines}")
