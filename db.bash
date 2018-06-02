docker run --name dronedb -p 3306:3306 -e MYSQL_ROOT_PASSWORD=abc123_ -d mysql

进入mysql容器：docker exec -it dronedb bash

mysql -u root -p

更改默认的加密方式：ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root';

grant all privileges ON *.* TO 'root'@'%' IDENTIFIED BY PASSWORD '*81F5E21E35407D884A6CD4A731AEBFB6AF209E1B'