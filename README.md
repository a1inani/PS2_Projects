# PS2 Projects

To install Docker Engine, follow the instructions here: https://docs.docker.com/engine/install/

Open a new terminal.
To open the docker container's shell while binding the current directory to "/project" inside the container and changing the container's current directory to "/project", run the following command:

```
docker run -it -w /project -v /Users/alinani/Desktop/PS2_Projects:/project ps2dev/ps2dev sh
```

To install GNU Make, run the following command:

```
apk add make nano git mpc mpc1 mpfr4 gmp zip
```

You can now use your usual development commands using the docker container.
The container directory ("/Users/alinani/Desktop/PS2_Projects" bind) is a view of the local directory ("/Users/alinani/Desktop/PS2_Projects" on the local filesystem), so changes to either directory will be synchronized.

After you are finished with the docker container, in the terminal where you typed "docker run", run the following command:

```
exit
```

To build an elf file, run the following in the project directory (within the docker container)

```
make
```

To generate ISOs, ensure that genisoimage has been installed in the container. Then include the command in your MakeFile.
