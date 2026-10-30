import os
import zipfile

output_zip = 'public/partyverse_kayip_sinyal_source.zip'
exclude_dirs = {'node_modules', '.git', 'dist', '__pycache__'}

with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            if file == 'partyverse_kayip_sinyal_source.zip':
                continue
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, '.')
            zipf.write(file_path, arcname)

print(f"Archive successfully created: {output_zip} ({os.path.getsize(output_zip)} bytes)")
