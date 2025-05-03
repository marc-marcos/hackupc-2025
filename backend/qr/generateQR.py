import qrcode
from PIL import Image

# Step 1: Data to encode
data = "GOAT"
def generateQR(data: str, name_qr: str, name_image: str):

    print("QR code with goat saved as 'qr_with_goat.png'")

    # Step 2: Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # High error correction
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    # Step 3: Create QR image
    qr_img = qr.make_image(fill_color="black", back_color="white").convert('RGB')

    # Step 4: Open goat image
    logo = Image.open("{name_image}.png")

    # Resize goat image to fit in the center
    qr_width, qr_height = qr_img.size
    logo_size = qr_width // 4  # Logo is 1/4th of QR width
    logo = logo.resize((logo_size, logo_size), Image.LANCZOS)

    # Calculate position to paste
    pos = ((qr_width - logo_size) // 2, (qr_height - logo_size) // 2)

    # Step 5: Paste the logo
    qr_img.paste(logo, pos, mask=logo if logo.mode == 'RGBA' else None)

    # Save final QR code
    qr_img.save(f"{name_qr}.png")