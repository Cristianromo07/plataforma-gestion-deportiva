#!/bin/bash

# Este script simula un ataque de fuerza bruta para probar la seguridad
# Intenta hacer log in 70 veces muy rápido.
# Como el límite en Dev es 60, debería bloquearse al llegar al 61.

echo " INICIANDO PRUEBA DE SEGURIDAD (RATE LIMIT)"
echo "---------------------------------------------"
echo "Objetivo: Superar las 60 peticiones/minuto"
echo "Esperando: Ver códigos 200/401 al principio y 429 al final."
echo "---------------------------------------------"

URL="http://localhost:3000/api/login"
JSON='{"email":"test_security@example.com", "password":"randompassword"}'

for i in {1..70}
do
   # Hacemos la petición y extraemos solo el código HTTP
   CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $URL -H "Content-Type: application/json" -d "$JSON")
   
   if [ "$CODE" == "429" ]; then
       echo " Intento $i: BLOQUEADO POR SEGURIDAD (Código 429)"
       echo "---------------------------------------------"
       echo "¡PRUEBA EXITOSA! El sistema detuvo el ataque."
       exit 0
   else
       echo " Intento $i: Permitido (Código $CODE)"
   fi
done

echo " No se logró bloquear. ¿Tal vez el límite es más alto de 70?"
