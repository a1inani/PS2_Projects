#include <kernel.h>
#include <draw.h>
#include <gs_psm.h>
#include <dma.h>
#include <dma_tags.h>
#include <graph.h>

int printf(const char *format, ...);

#define OFFSET_X 0
#define OFFSET_Y 0

int gs_init(int width, int height, int psm, int psmz, int vmode, int gmode)
{
    unsigned int fb_address = graph_vram_allocate(width, height, psm, GRAPH_ALIGN_PAGE);
    //unsigned int zbuf_address = graph_vram_allocate(w, h, psmz, GRAPH_ALIGN_PAGE);
    graph_set_mode(gmode, vmode, GRAPH_MODE_FIELD, GRAPH_DISABLE);
    graph_set_screen(OFFSET_X, OFFSET_Y, width, height);
    graph_set_bgcolor(0, 0, 0);
    graph_set_framebuffer_filtered(fb_address, width, psm, 0, 0);
    graph_enable_output();

    qword_t buf[20];
    qword_t *q = buf;
    q = draw_primitive_xyoffset(q, 0, 0, 0);
    q = draw_finish(q);
    dma_channel_send_normal(DMA_CHANNEL_GIF, buf, q-buf, 0, 0);
    dma_wait_fast();

    return 0;
}

int main()
{
    printf("Hello\n");
    // init DMAC
    dma_channel_initialize(DMA_CHANNEL_GIF, 0, 0);
    dma_channel_fast_waits(DMA_CHANNEL_GIF);
    // initialize graphics mode 
    gs_init(664, 480, GS_PSM_32, GS_PSMZ_32, GRAPH_MODE_NTSC, GRAPH_MODE_FIELD);
    // clear 

    // build buffer with triangle data

}