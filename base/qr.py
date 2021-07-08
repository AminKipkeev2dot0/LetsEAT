import os
import shutil
from pathlib import Path

import pyqrcode
from PIL import Image, ImageDraw, ImageFilter, ImageFont

BASE_DIR = Path(__file__).resolve().parent.parent


def mask_circle_transparent(pil_img: Image):
    """Округление самого qr кода. Возвращает готовый результат"""

    mask = Image.new("L", pil_img.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((-70, -70, 419, 418), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(0))

    result = pil_img.copy()
    result.putalpha(mask)

    return result


def create_qr(url: str, number_table: str, establishment_id: str) -> str:
    """Создание самого qr кода. Возвращает путь к изображению с ним"""

    big_code = pyqrcode.create(url, error='H', version=8, mode='binary')
    big_code.png('qr.png', scale=6, module_color=[243, 126, 16], background=[0xff, 0xff, 0xff])

    im = Image.open('qr.png').convert('RGBA')
    thumb_width = 350

    im_square = (im.resize((thumb_width, thumb_width), Image.LANCZOS)).convert('RGBA')
    im_thumb = mask_circle_transparent(im_square)
    im_thumb.convert('RGBA')

    # Создание папки под изображение
    Path(str(BASE_DIR / f'temp/qr/{establishment_id}_{number_table}/')).mkdir(parents=True, exist_ok=True)
    path_save = str(BASE_DIR / f'temp/qr/{establishment_id}_'
                               f'{number_table}/qr.png')
    im_thumb.save(path_save)
    return path_save


def interpolate(f_co: tuple, t_co: tuple, interval):
    """Нужно для создания градиента для окончательного изображения"""
    det_co = [(t - f) / interval for f, t in zip(f_co, t_co)]
    for i in range(interval):
        yield [round(f + det * i) for f, det in zip(f_co, det_co)]


def create_bg() -> str:
    """Создание изображение с градиентом. Возвращает путь к нему"""

    im = Image.new('RGBA', (403, 622))

    gradient = Image.new('RGBA', im.size, color=0)
    draw = ImageDraw.Draw(gradient)

    from_colors = (242, 191, 16)
    to_colors = (243, 127, 16)
    for i, color in enumerate(interpolate(from_colors, to_colors, im.height * 2)):
        draw.line([(i, 0), (0, i)], tuple(color), width=1)

    im_composite = Image.alpha_composite(gradient, im)

    # Создание папки под изображение
    Path(str(BASE_DIR / f'temp/qr/')).mkdir(
        parents=True, exist_ok=True)
    path_save = str(BASE_DIR / f'temp/qr/bg.png')

    im_composite.save(path_save)

    return path_save


def add_qr_to_img(path_image: str, path_bg: str, number_table: str,
                  establishment_id: str) -> str:
    """Вставляет изображение с qr кодом в изображение с градиентом.
    Возвращает путь к окончательному изображению"""

    img = Image.open(path_image, 'r')
    img_w, img_h = img.size
    background = Image.open(path_bg)
    bg_w, bg_h = background.size
    offset = ((bg_w - img_w) // 2, (bg_h - img_h) // 2 + 30)
    background.paste(img, offset, img)

    # Создание папки под изображение
    Path(str(BASE_DIR / f'temp/qr/{establishment_id}_{number_table}/')).mkdir(
        parents=True, exist_ok=True)
    path_save = str(BASE_DIR / f'temp/qr/{establishment_id}_'
                               f'{number_table}/qr_with_bg.png')
    background.save(path_save)
    return path_save


def draw_text(number_table: str, path_save: str, path_qr_with_bg: str) -> str:
    """Рисует текст. Последний шаг создания изображения с qr кодом.
    Сохраняет его в папку /media/user_id/establishment_id/number_table.png.
    Возвращает путь к файлу"""

    font_number = ImageFont.truetype(
        str(BASE_DIR / 'static/fonts/Gilroy/Black/gilroy-black.ttf'), 65)
    font_table = ImageFont.truetype(
        str(BASE_DIR / 'static/fonts/Gilroy/Black/gilroy-black.ttf'), 24)
    font_camera = ImageFont.truetype(
        str(BASE_DIR / 'static/fonts/Gilroy/Black/gilroy-black.ttf'), 28)

    img = Image.open(path_qr_with_bg, 'r')
    draw = ImageDraw.Draw(img)

    width_img = img.size[0]

    width_number_table = font_number.getsize(number_table)[0]
    width_table = font_table.getsize('Столик')[0]
    width_camera = font_camera.getsize('НАВЕДИ КАМЕРУ!')[0]

    pos_x_number_table = int(width_img / 2 - width_number_table / 2)
    pos_x_table = int(width_img / 2 - width_table / 2)
    pos_x_camera = int(width_img / 2 - width_camera / 2)

    draw.text(
        (pos_x_number_table, 45),
        number_table, (255, 255, 255),
        font=font_number)
    draw.text(
        (pos_x_table, 112),
        'Столик', (255, 255, 255),
        font=font_table)
    draw.text(
        (pos_x_camera, 530),
        'НАВЕДИ КАМЕРУ!', (255, 255, 255),
        font=font_camera)

    # Создание папки под qr
    Path(f"{path_save}").mkdir(parents=True, exist_ok=True)

    path_img = f'{path_save}/{number_table}.png'

    img.save(path_img)
    return path_img


def clear_files(path_qr, path_bg, clear_bg=False):
    """Очищает временные изображения, которые создавались во время
    выполнения кода"""

    if clear_bg:
        os.remove(path_bg)

    # Удаление папки
    shutil.rmtree('/'.join(path_qr.split(os.path.sep)[:-1]))


def build_qr(url: str, path_save: str, number_table: str,
             establishment_id: str, clear_bg=False) -> str:

    path_bg: Path = BASE_DIR / 'temp/qr/bg.png'
    if not Path.exists(path_bg):
        create_bg()
    path_bg: str = str(path_bg)

    path_qr = create_qr(url, number_table, establishment_id)
    path_qr_with_bg = add_qr_to_img(path_qr, path_bg, number_table,
                                    establishment_id)
    path_complete = draw_text(number_table, path_save, path_qr_with_bg)

    clear_files(path_qr, path_bg, clear_bg)

    return path_complete


if __name__ == '__main__':
    build_qr('https://letseat.su/client_page/481845/32')
