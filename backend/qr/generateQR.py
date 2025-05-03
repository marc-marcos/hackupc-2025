import qrcode 

url = "http://192.168.1.42/"  # Replace with your actual IP and port
img = qrcode.make(url)
img.save("raspi_web_qr.png")

