#!/bin/bash

# Function to replace "Aave" with "Pegasys" in file names
replace_in_filenames() {
    for file in *Aave*; do
        if [ -f "$file" ]; then
            mv "$file" "${file//Aave/Pegasys}"
        fi
    done
}

replace_in_folder_names() {
    for folder in *Aave*/; do
        if [ -d "$folder" ]; then
            mv "$folder" "${folder//Aave/Pegasys}"
        fi
    done
}

# Function to replace "Aave" with "Pegasys" in file content
replace_in_file_content() {
    find . -type f -exec sed -i 's/Aave/Pegasys/g' {} +
}

# Recursive function to process subfolders
process_subfolders() {
    # Check if there are subdirectories
    if compgen -G "*/" >/dev/null; then
        for folder in */; do
            cd "$folder"
            replace_in_filenames
            replace_in_folder_names
            replace_in_file_content
            process_subfolders
            cd ..
        done
    fi
}

# Navigate to the target folder
cd contracts

# Replace "Aave" with "Pegasys" in file names
replace_in_filenames

# Replace "Aave" with "Pegasys" in folder names
replace_in_folder_names

# Replace "Aave" with "Pegasys" in file content
replace_in_file_content

# Recursively process subfolders
process_subfolders