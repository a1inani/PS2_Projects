# _____     ___ ____     ___ ____
#  ____|   |    ____|   |        | |____|
# |     ___|   |____ ___|    ____| |    \    PS2DEV Open Source Project.
#-----------------------------------------------------------------------
# Copyright 2001-2022, ps2dev - http://www.ps2dev.org
# Licenced under Academic Free License version 2.0
# Review ps2sdk README & LICENSE files for further details.

EE_BIN = helloworld.elf
EE_OBJS = helloworld.o
EE_LIBS = -ldebug -lc

ISO_TGT = helloworld.iso

$(ISO_TGT): $(EE_BIN)
	genisoimage -l -o $(ISO_TGT) $(EE_BIN) SYSTEM.CNF

all: $(EE_BIN)
	$(EE_STRIP) --strip-all $(EE_BIN)

clean:
	rm -rf $(EE_OBJS) $(EE_BIN) $(ISO_TGT)

# Include makefiles
include $(PS2SDK)/samples/Makefile.pref
include $(PS2SDK)/samples/Makefile.eeglobal
