# _____     ___ ____     ___ ____
#  ____|   |    ____|   |        | |____|
# |     ___|   |____ ___|    ____| |    \    PS2DEV Open Source Project.
#-----------------------------------------------------------------------
# Copyright 2001-2022, ps2dev - http://www.ps2dev.org
# Licenced under Academic Free License version 2.0
# Review ps2sdk README & LICENSE files for further details.

EE_BIN = tmtc1.elf

# KERNEL_NOPATCH = 1
# NEWLIB_NANO = 1

EE_LIBS =-ldma -lgraph -ldraw -lkernel -ldebug
EE_OBJS = main.o
EE_CFLAGS += -fdata-sections -ffunction-sections
EE_LDFLAGS += -Wl,--gc-sections

ISO_TGT = tmtc1.iso

ifeq ($(DUMMY_TIMEZONE), 1)
   EE_CFLAGS += -DDUMMY_TIMEZONE
endif

ifeq ($(DUMMY_LIBC_INIT), 1)
   EE_CFLAGS += -DDUMMY_LIBC_INIT
endif

ifeq ($(KERNEL_NOPATCH), 1)
   EE_CFLAGS += -DKERNEL_NOPATCH
endif

ifeq ($(DEBUG), 1)
  EE_CFLAGS += -DDEBUG -O0 -g
else 
  EE_CFLAGS += -Os
  EE_LDFLAGS += -s
endif

$(ISO_TGT): $(EE_BIN)
	genisoimage -o $(ISO_TGT) $(EE_BIN) SYSTEM.CNF

all: $(EE_BIN)

clean:
	rm -rf $(EE_OBJS) $(EE_BIN)

# Include makefiles
include $(PS2SDK)/samples/Makefile.pref
include $(PS2SDK)/samples/Makefile.eeglobal
