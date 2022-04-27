#! /usr/bin/bash
DOMAIN=matrix.mydomain.com

docker run -it --rm --mount type=volume,src=matrix-bridges_synapse,dst=/data -e SYNAPSE_SERVER_NAME=$DOMAIN -e SYNAPSE_REPORT_STATS=no matrixdotorg/synapse:latest generate

echo "Change the following things in homeserver.yaml"
echo "enable_registration: true"
echo "enable_registration_without_verification: true"

read -p "Press enter to continue, make that you changed the above values and saved the file"
docker-compose up -d --force-recreate matrix-synapse

echo "Now create your Matrix account"
read -p "Press enter to continue"

echo "Change the following things in homeserver.yaml"
echo "enable_registration: false"

read -p "Press enter to continue, make that you changed the above values and saved the file"
docker-compose up -d --force-recreate matrix-synapse

echo "Now you can setup the matrix bridges"
echo "You can find example files in the the bridges directory, however, you NEED to edit all CHANGEME values and put them in the right docker volume"

read -p "Press enter to continue, make sure that you put the correct configuration files"
docker-compose up -d --force-recreate

echo "There should be registration.yaml files for the discord, signal and whatsapp bridge"
echo "Make sure to copy them to /var/lib/docker/volumes/matrix-bridges_synapse/_data/registration"
echo "After that edit the homeserver.yaml file again and change the following"
echo "app_service_config_files:"
echo "  - /data/registration/discord-registration.yaml"
echo "  - /data/registration/signal-registration.yaml"
echo "  - /data/registration/whatsapp-registration.yaml"

read -p "Press enter to continue, make that you changed the above values and saved the file"
docker-compose up -d --force-recreate

echo "Everything should be good to go!"
echo "You can use the Discord bot using @_discordpuppet_bot:matrix.yourdomain.com"
echo "You can use the Signal bot using @_signal_bridge:matrix.yourdomain.com"
echo "You can use the Whatsapp bot using @_whatsapp_bridge:matrix.yourdomain.com"