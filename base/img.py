from PIL import Image, ImageDraw, ImageFont


def interpolate(f_co: tuple, t_co: tuple, interval):
    det_co = [(t - f) / interval for f, t in zip(f_co, t_co)]
    for i in range(interval):
        yield [round(f + det * i) for f, det in zip(f_co, det_co)]


def create_bg():
    im = Image.new('RGBA', (403, 622))

    gradient = Image.new('RGBA', im.size, color=0)
    draw = ImageDraw.Draw(gradient)

    from_colors = (242, 191, 16)
    to_colors = (243, 127, 16)
    for i, color in enumerate(interpolate(from_colors, to_colors, im.height * 2)):
        draw.line([(i, 0), (0, i)], tuple(color), width=1)

    im_composite = Image.alpha_composite(gradient, im)
    im_composite.show()

    im_composite.save('result.png')


img = Image.open('test.png', 'r')
img_w, img_h = img.size
background = Image.open('result.png')
bg_w, bg_h = background.size
offset = ((bg_w - img_w) // 2, (bg_h - img_h) // 2)
background.paste(img, offset)
background.save('out.png')



def draw_text(number_table):
    font_number = ImageFont.truetype("../static/fonts/Gilroy/Black/gilroy-black.ttf", 60)
    font_table = ImageFont.truetype("../static/fonts/Gilroy/Black/gilroy-black.ttf", 30)
    font_camera = ImageFont.truetype("../static/fonts/Gilroy/Black/gilroy-black.ttf", 30)

    test_image = Image.open('out.png', 'r')
    draw = ImageDraw.Draw(test_image)

    width_img = test_image.size[0]

    width_number_table = font_number.getsize(number_table)[0]
    width_table = font_table.getsize('Столик')[0]
    width_camera = font_camera.getsize('НАВЕДИ КАМЕРУ!')[0]

    pos_x_number_table = int(width_img / 2 - width_number_table / 2)
    pos_x_table = int(width_img / 2 - width_table / 2)
    pos_x_camera = int(width_img / 2 - width_camera / 2)

    draw.text((pos_x_number_table, 30), number_table, (255, 255, 255), font=font_number)
    draw.text((pos_x_table, 85), 'Столик', (255, 255, 255), font=font_table)
    draw.text((pos_x_camera, 495), 'НАВЕДИ КАМЕРУ!', (255, 255, 255), font=font_camera)

    test_image.save('testt.png')


draw_text('13')