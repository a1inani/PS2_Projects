# PS2 Projects

To install Docker Engine, follow the instructions here: https://docs.docker.com/engine/install/

In this example, "PROJECTDIR" will be used in place of the project directory.
Open a new terminal.
To open the docker container's shell while binding the current directory to "/project" inside the container and changing the container's current directory to "/project", run the following command:

```
docker run -it -w /project -v PROJECTDIR:/project ps2dev/ps2dev sh
```

To install GNU Make, run the following command:

```
apk add make
```

You can now use your usual development commands using the docker container.
The container directory ("PROJECTDIR" bind) is a view of the local directory ("PROJECTDIR" on the local filesystem), so changes to either directory will be synchronized.

After you are finished with the docker container, in the terminal where you typed "docker run", run the following command:

```
exit
```