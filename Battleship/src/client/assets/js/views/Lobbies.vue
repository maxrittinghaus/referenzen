<template>
    <div class="container">
        <div class="lobbies-wrapper">
            <!--<div class="header">-->
            <!--    <h1 class="display-4">Play</h1> -->
            <!--</div>-->
            <div class="actions">
               <base-button class="createRoom" @click="createRoom" type="primary">Start a game</base-button>
            </div>
        </div>
    </div>
</template>
<script>
export default {
  data() {
    return {
      lobbies: [
         {name: 'Lobby #123456'}      ]
    }
  },
  
  methods: {
      isThereAJoinableGame() {
          return false;
      },
      createRoom() {
         this.$router.push({ name: 'game' });
      }
  }
};
</script>
<style lang="scss" scoped>
.container {
    margin-top: -53px;
    display: flex;
    justify-content: center;
    
    .lobbies-wrapper {
        width: 100%;
        max-width: 500px;
        background: #fff;
        box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.08), 0px 4px 4px rgba(0, 0, 0, 0.25);
        
        .header {
            display: flex;
            justify-content: center;
            align-items: center;
            
            h1 {
                font-weight: 300;
                margin: 0;
            }
            
            height: 53px;
        }
        
        .actions {
            display: flex;
            align-items: center;
            justify-content: space-around;
            /*height: 53px;*/
            padding: 50px;
        }
    }
}
</style>
