import os

# Define the root directory
root_dir = "src/app/features"

# Define the output Markdown file
output_file = "features_files.md"

# Open the output file in write mode
with open(output_file, "w") as markdown_file:
    # Walk through the directory structure
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            # Construct the full file path
            file_path = os.path.join(dirpath, filename)
            relative_path = os.path.relpath(file_path, root_dir)

            # Write the file name and content to the markdown file
            markdown_file.write(f"### {relative_path}\n\n")
            markdown_file.write("```")
            markdown_file.write("\n")

            # Read the file content and add it to the markdown file
            try:
                with open(file_path, "r") as f:
                    content = f.read()
                    markdown_file.write(content)
            except Exception as e:
                markdown_file.write(f"Error reading file: {e}")

            markdown_file.write("\n```")
            markdown_file.write("\n\n")
