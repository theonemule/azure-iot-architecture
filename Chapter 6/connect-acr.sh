#!/bin/bash


for i in "$@"
do
	case $i in
		--acrname=*)
		ACR_NAME="${i#*=}" 
		;;
		--spname=*)
		SP_NAME="${i#*=}"
		;;
		*)
		;;
	esac
done


if [ -z "$ACR_NAME" ]
then
	echo "fatal: ACR name is not set" && exit 1
fi

if [ -z "$SP_NAME" ]
then
	SP_NAME="arcdemo"
fi

ACR_REGISTRY_ID=$(az acr show --name $ACR_NAME --query "id" --output tsv)

PASSWORD=$(az ad sp create-for-rbac --name $SP_NAME --scopes $ACR_REGISTRY_ID --role acrpush --query "password" --output tsv)
USER_NAME=$(az ad sp list --display-name $SP_NAME --query "[].appId" --output tsv)

kubectl create secret docker-registry acrcreds  --docker-server=$ACR_NAME.azurecr.io  --docker-username=$USER_NAME --docker-password=$PASSWORD

echo "Service principal ID: $USER_NAME"
echo "Service principal password: $PASSWORD"
