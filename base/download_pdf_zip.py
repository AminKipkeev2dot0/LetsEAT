import os
from pathlib import Path
import zipfile
from fpdf import FPDF

BASE_DIR = Path(__file__).resolve().parent.parent


def create_zip(path: str, zip_f: zipfile.ZipFile):
    """Создание архива с qr кодами"""
    for root, dirs, files in os.walk(path):
        for file in files:
            zip_f.write(os.path.join(root, file),
                        os.path.relpath(os.path.join(root, file),
                                        os.path.join(path, '..')))


def build_zip(path_with_qr: str, path_save: str):
    """Сборщик зип архива"""
    if Path.exists(Path(path_with_qr)):
        zip_file = zipfile.ZipFile(path_save, 'w', zipfile.ZIP_DEFLATED)
        create_zip(path_with_qr, zip_file)
        zip_file.close()
        return True
    else:
        return False


def sort_pdf(a):
    a = int(a.split('.')[0])
    return a


def create_pdf(path_qr: str, path_save: str):
    pdf = FPDF('P', 'mm', (100, 60))
    if Path.exists(Path(path_qr)):
        image_list = [f for f in os.listdir(path_qr)
                      if os.path.isfile(os.path.join(path_qr, f))]
        image_list.sort(key=sort_pdf)
        for image in image_list:
            image = path_qr + '/' + image

            pdf.add_page()
            pdf.image(image, x=36, y=40)
            pdf.image()
        pdf.output(path_save, "F")
        return True
    else:
        return False
