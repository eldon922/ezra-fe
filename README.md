# Deployment Resources

- https://www.digitalocean.com/community/developer-center/deploying-a-next-js-application-on-a-digitalocean-droplet

- https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu

- https://www.digitalocean.com/community/tutorials/ufw-essentials-common-firewall-rules-and-commands

# Linux Snippets

```shell
# DEPLOY FRONTEND ########################################################################

cd /var/www/ezra-fe
git checkout main
git pull
npm install --legacy-peer-deps
npm run build
pm2 restart ezra-fe
pm2 logs

------------------------------------------------------------------------------------------

pm2 logs

# COPY/CUT/REMOVE/RENAME/LINK FILES ######################################################

cp -r /usr/bin/ffmpeg /root/ezra-be/venv/bin/ffmpeg
scp root@104.248.159.174:/root/ezra-be/txt/eldon/2455-10minutes.txt .
scp -P 47903 C:/Users/AVOWS/Desktop/ASR/audio_files/3648.mp3 user@194.106.118.83:~/whisper/audio_files/3648.mp3
mv ezra-be /home/ezra_user/
ln -s /usr/bin/ffprobe /root/ezra-be/venv/bin/ffprobe

# NGINX FRONTEND #########################################################################

sudo nano /etc/nginx/sites-available/transcript.griibandung.org

------------------------------------------------------------------------------------------

server {
  listen 80;
  server_name transcript.griibandung.org www.transcript.griibandung.org;
  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}

------------------------------------------------------------------------------------------

sudo nginx -t
sudo systemctl restart nginx

sudo ln -s /etc/nginx/sites-available/transcript.griibandung.org /etc/nginx/sites-enabled/

# SSL #####################################################################################

sudo certbot --nginx -d transcript.griibandung.org -d www.transcript.griibandung.org
```