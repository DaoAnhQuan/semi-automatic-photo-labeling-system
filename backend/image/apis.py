from zipfile import ZipFile
import os
from os.path import basename
from os import remove
# create a ZipFile object
with ZipFile('datasets.zip', 'w') as zipObj:
    # Iterate over all the files in directory
    for folderName, subfolders, filenames in os.walk("image_auto"):
        for filename in filenames:
            # create complete filepath of file in directory
            filePath = os.path.join(folderName, filename)
            # Add file to zip
            zipObj.write(filePath, basename(filePath))
remove("datasets.zip")
