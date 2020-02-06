<template>
    <div id="app">
        <header :class="{'isBig': isBig()}" :style="getHeaderColor()">
            <h1>{{getTitle()}}</h1>
        </header>
        <main :class="{'isBig': isBig()}">
            <fade-transition origin="center" mode="out-in" :duration="125">
                <router-view/>
            </fade-transition>
        </main>
        <div class="tag">
            <span>
                Made with <i class="fa fa-heart pulse"></i> in <a href="https://www.google.com/maps/place/Remscheid/data=!4m2!3m1!1s0x47b92a4209034083:0x5853b021429a8153?sa=X&ved=2ahUKEwipls2Aq9PiAhUS16QKHagwCOsQ8gEwAHoECAoQAQ" target="_blank">Remscheid</a>
            </span>
        </div>
    </div>
</template>
<script>
import { FadeTransition } from "vue2-transitions";

export default {
  components: {
    FadeTransition
  },
  methods: {
      getTitle() {
          return this.$route.meta.title || 'Battleship';
      },
      isBig() {
          return this.$route.meta.isBigHeader || false;
      },
      isGray() {
          return this.$route.meta.isGrayHeader || false;
      },
      getHeaderColor() {
          let background = this.$route.meta.headerColor || '#5E72E4';
          
          return {
              background,
          }
      }
  }
};
</script>

<style lang="scss" scoped>
    header {
        height: 200px;
        background: var(--primary);
        display: flex;
        justify-content: center;
        align-items: center;
        user-select: none;
        transition: height 250ms, background 250ms;
        
        h1 {
            color: #fff;
        }
        
        &.isBig {
            height: 50vh;
            
            h1 {
                font-size: 80px;
            }
        }
        
    }
    
    main {
        overflow: visible;
        position: relative;
        
        height: calc(100vh - 200px);
        
        &.isBig {
            height: 50vh;
        }
    }
    
    .tag {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: -1;
        user-select: none;
        
        .pulse {
            animation: pulse .35s infinite alternate;
            -webkit-animation: pulse .35s infinite alternate;
        }
    }
    
    @-webkit-keyframes pulse {
      to {
        transform: scale(1.1);
      }
    }

      @keyframes pulse {
          to {
            transform: scale(1.1);
          }
      }
</style>
