<template>
    <div class="container">
        <div class="game-wrapper">
            <canvas class="field player" :class="{'active': isPlayerFieldActive}" ref="playerField"></canvas>   
            <canvas class="field enemy" :class="{'active': isEnemyFieldActive, hide: isPlayerEditing}" ref="enemyField"></canvas>
            <div class="actions" v-if="isPlayerEditing">
                <base-button type="default" @click="randomizeShips">Randomize</base-button>
                <base-button type="primary" @click="startGame">Play</base-button>
            </div>  
            <div class="actions" v-if="didSomeoneWon">
                <base-button type="primary" @click="$router.go()">Restart</base-button>
            </div>  
            
        </div>
    </div>
</template>

<script>
    import EShipDirections from '@enum/EShipDirections'
    import EGameState from '@enum/EGameState'
    import EFieldState from '@enum/EFieldState'
    import Field from "@client/lib/Field"
    
    export default {
        data() {
            return {
                enemyField: null,    
                playerField: null,
                state: EGameState.PLAYER_EDIT,
                timeoutId: null,
                timeoutBot: null,
                hitDelay: 500,
            }
        },
        components:{
        },
        mounted() {
            
            this.playerField = new Field(this.$refs.playerField, 12, 12);
            this.enemyField = new Field(this.$refs.enemyField, 12, 12, EFieldState.ENEMY);
            
            this.playerField.on('miss', () => {
                this.playerField.canShoot = false;
                clearTimeout(this.timeoutId);
                this.timeoutId = setTimeout(() => {
                    this.nextPlayer();
                }, this.hitDelay);
            });
            
            this.enemyField.on('miss', () => {
                this.enemyField.canShoot = false;
                clearTimeout(this.timeoutId);
                this.timeoutId = setTimeout(() => {
                    this.nextPlayer();
                }, this.hitDelay);
            });
            
            this.playerField.on('hit', () => {
                clearTimeout(this.timeoutId);
                if(!this.checkWinState()) {
                    this.timeoutId = setTimeout(() => {
                        this.playerField.botHit();
                    }, this.hitDelay);
                } else {
                    this.playerField.canShoot = false;
                }
            });
            
            this.enemyField.on('hit', () => {
                if(!this.checkWinState()) {
                    
                } else {
                    this.enemyField.canShoot = false;
                }
            });
            
            this.updateState();
        },
        methods: {
            setHeaderState(title, headerColor) {
                this.$route.meta.headerColor = headerColor;
                this.$route.meta.title = title;
                this.$router.replace({query: {temp: Date.now()}});
                this.$router.replace({query: {temp: undefined}});
            },
            getHeaderTitle() {
                switch(this.state) {
                    case EGameState.ENEMY_TURN:
                        return "Enemy's turn";
                    case EGameState.PLAYER_TURN:
                        return "Your turn";
                    case EGameState.PLAYER_EDIT:
                        return "Place your ships";
                    case EGameState.PLAYER_WON:
                        return "VICTORY";
                    case EGameState.ENEMY_WON:
                        return "DEFEAT";
                }
                
            },
            
             getHeaderColor() {
                switch(this.state) {
                    case EGameState.ENEMY_TURN:
                        return "rgba(147, 145, 145, 0.9)";
                    case EGameState.PLAYER_EDIT:
                    case EGameState.PLAYER_TURN:
                        return "#5E72E4";
                    case EGameState.PLAYER_WON:
                        return "#2DCE89";
                    case EGameState.ENEMY_WON:
                        return "#F5365C";
                }
                
            },
            
            randomizeShips() {
                this.playerField.randomizeShips();
            },
            
            startGame() {
                this.state = EGameState.PLAYER_TURN;
            },
            
            nextPlayer() {
                this.state = this.state === EGameState.PLAYER_TURN ? EGameState.ENEMY_TURN : EGameState.PLAYER_TURN;
            },
            
            updateState() {
                this.setHeaderState(this.getHeaderTitle(), this.getHeaderColor());
                
                if(this.state === EGameState.PLAYER_EDIT) {
                    this.playerField.state = EFieldState.EDITABLE;
                } else {
                    this.playerField.state = EFieldState.PLAYER;
                }
                
                this.enemyField.canShoot = this.state === EGameState.PLAYER_TURN;
                
                if(this.state === EGameState.ENEMY_TURN) {
                    this.playerField.canShoot = true;
                    clearTimeout(this.timeoutBot);
                    this.timeoutId = setTimeout(() => {
                        this.playerField.botHit();
                    }, this.hitDelay);
                } else {
                    this.playerField.canShoot = false;
                }
                
                
                this.$nextTick(() => {
                    this.playerField.handleResize();
                    this.enemyField.handleResize();
                });
                
            },
            
            checkWinState() {
                if(this.playerField.areAllShipsDestroyed()) {
                    this.state = EGameState.ENEMY_WON
                    return true;
                } else if (this.enemyField.areAllShipsDestroyed()) {
                    this.state = EGameState.PLAYER_WON;
                    return true;
                }
            }
        },
        computed: {
            isPlayerFieldActive() {
                return this.state === EGameState.ENEMY_TURN || this.state === EGameState.PLAYER_EDIT || this.state === EGameState.ENEMY_WON
            },
            isEnemyFieldActive() {
                return this.state === EGameState.PLAYER_TURN || this.state === EGameState.PLAYER_WON;
            },
            isPlayerEditing() {
                 return this.state === EGameState.PLAYER_EDIT
            },
            didSomeoneWon() {
                 return this.state === EGameState.PLAYER_WON || this.state === EGameState.ENEMY_WON
            },
        },
        watch: {
            state() {
                this.updateState();
            }
        }
    }
</script>

<style lang="scss" scoped>

.game-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.field {
    height: 600px;
    width: 600px;
    background-color: #fff;
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.08), 0px 4px 4px rgba(0, 0, 0, 0.25);
    margin-top: -20px;
    position: absolute;
    
    &:not(.active) {
        height: 200px;
        width: 200px;
        bottom: 50px;
    }
    
    &.player:not(.active) {
        left: 50px;
    }

    &.enemy:not(.active) {
        right: 50px;
    }
    
    &.hide {
        opacity: 0;
    }
}

.actions {
    margin-top: 620px;
}

</style>
