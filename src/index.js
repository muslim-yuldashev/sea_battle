import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";

const MAP_WIDTH = 5;
const MAP_HEIGHT = 5;
const SHIP_COUNT = 8;

const Square = (props) => {
  return (
      <div className="square"
           style={{"backgroundColor": props.color}}
           onClick={() => props.onCellClick()}
      />
  );
};

function createCell(x, y) {
  return {
    has_ship: false,
    is_attacked: false,
    x: x,
    y: y,
  }
}

function generateMap() {
  const map = [];
  for(let i = 0; i < MAP_WIDTH; i++) {
    map.push([]);
    for (let j = 0; j < MAP_HEIGHT; j++) {
      map[i].push(createCell(i, j));
    }
  }

  return map;
}

function initialState() {
  const player_1 = {
    name: '',
    sea_map: generateMap()
  };
  const player_2 = {
    name: '',
    sea_map: generateMap()
  };

  return {
    player_name_input: '',
    step: 'arrangement', // arrangement, game, announcement
    game: {
      message: '',
      current_player: 1,
      step: 'start_turn', // start_turn, move, end_turn
      selected_position_for_attack: {
        x: -1,
        y: -1
      }
    },
    player_1: player_1,
    player_2: player_2
  }
}

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = initialState();
  }

  renderMyFleet() {
    if ((this.state.step === 'game' && this.state.game.step === 'start_turn') || this.state.step === 'announcement') {
      return null;
    }

    const current_player = this.getCurrentPlayer();
    return (
        <>
          <div className='margin'>
            <label className='text3'>My fleet</label>
            {
              current_player.sea_map.map((row) => {
                return (
                    <div className="row">
                      {row.map((cell) => {
                        return (
                            <Square
                                color={cell.has_ship ? 'blue' : 'white'}
                                onCellClick={() => {
                                  if (this.state.step === 'arrangement') {
                                    const currentPlayer = this.getCurrentPlayer();

                                    const ready_ships_count = currentPlayer.sea_map.flat().filter(i => i.has_ship).length;

                                    if (ready_ships_count === SHIP_COUNT && !cell.has_ship) {
                                      alert("All ships are already in use. Total ship count: " + ready_ships_count);
                                    } else {
                                      if (cell.has_ship) {
                                        currentPlayer.sea_map[cell.x][cell.y].has_ship = false;
                                      } else {
                                        currentPlayer.sea_map[cell.x][cell.y].has_ship = true;
                                      }

                                      if (this.state.game.current_player === 1) {
                                        this.setState({
                                          ...this.state,
                                          player_1: currentPlayer
                                        });
                                      } else {
                                        this.setState({
                                          ...this.state,
                                          player_2: currentPlayer
                                        });
                                      }
                                    }
                                  }

                                }}
                            />
                        );
                      })}
                    </div>
                )
              })
            }
          </div>
        </>
    );
  }

  renderEnemyFleet() {
    if (this.state.step !== 'game' || (this.state.game.step !== 'move' && this.state.game.step !== 'end_turn'))
      return null;

    const enemy = this.getEnemy();

    return (
        <>
          <div className='margin'>
            <label className='text3'>Enemy fleet</label>
            {
              enemy.sea_map.map((row) => {
                return (

                    <div className="row">
                      {row.map((cell) => {
                        let color = 'white';
                        const game = this.state.game;

                        if (cell.has_ship && cell.is_attacked) {
                          color = 'red';
                        }
                        else if (!cell.has_ship && cell.is_attacked) {
                          color = 'orange';
                        }
                        else if (cell.x === game.selected_position_for_attack.x && cell.y === game.selected_position_for_attack.y) {
                          color = 'green';
                        }

                        return (
                            <Square color={color}
                                    onCellClick={() => {

                                      if (this.state.game.step === 'move' && !cell.is_attacked) {
                                        const game = this.state.game;

                                        if (cell.x === game.selected_position_for_attack.x && cell.y === game.selected_position_for_attack.y) {
                                          // unselect
                                          game.selected_position_for_attack = {
                                            x: -1,
                                            y: -1
                                          };
                                        } else {
                                          // select
                                          game.selected_position_for_attack = {
                                            x: cell.x,
                                            y: cell.y
                                          };
                                        }

                                        this.setState({
                                          ...this.state,
                                          game: game
                                        });

                                      }

                                    }}
                            />
                        );
                      })}
                    </div>
                );
              })
            }
          </div>
        </>
    );
  }

  renderBottomButtons() {
    if (this.state.step === 'arrangement') {
      return (
          <>
            <button className='button'
                onClick={() => {
              const currentPlayer = this.getCurrentPlayer();
              const ready_ships_count = currentPlayer.sea_map.flat().filter(i => i.has_ship).length;

              if (ready_ships_count !== SHIP_COUNT) {
                alert("Please use all ships!");
                return;
              }

              if (this.state.game.current_player === 1) {
                const player_1 = this.state.player_1;
                const game = this.state.game;

                player_1.name = this.state.player_name_input;
                game.current_player = 2;

                this.setState({
                  ...this.state,
                  game: game,
                  player_1: player_1,
                  player_name_input: ''
                });
              } else {
                const player_2 = this.state.player_2;
                const game = this.state.game;

                game.current_player = 1;
                player_2.name = this.state.player_name_input;

                this.setState({
                  ...this.state,
                  player_2: player_2,
                  game: game,
                  step:'game'
                });
              }
            }}>Confirm</button>
          </>
      );
    }
    else if (this.state.step === 'game') {
      if (this.state.game.step === 'start_turn') {
        return (
            <>
              <button className='button'
                  onClick={() => {
                const game = this.state.game;
                game.step = 'move';
                this.setState({...this.state, game: game});
              }}>Start move</button>
            </>
        );
      }
      else if (this.state.game.step === 'move') {
        return (
            <>
              <button className='button'
                  onClick={() => {
                const game = this.state.game;

                if (game.selected_position_for_attack.x >= 0 && game.selected_position_for_attack.y >= 0) {

                  const x = game.selected_position_for_attack.x;
                  const y = game.selected_position_for_attack.y;

                  const enemy = this.getEnemy();
                  enemy.sea_map[x][y].is_attacked = true;

                  const hash_ship = enemy.sea_map[x][y].has_ship;
                  const attacked_ships = enemy.sea_map.flat().filter(i => i.has_ship && i.is_attacked).length;

                  game.step = !hash_ship || attacked_ships === SHIP_COUNT ? 'end_turn' : 'move';
                  game.message = hash_ship ? 'Killed' : 'Missed';
                  game.selected_position_for_attack = {
                    x: -1,
                    y: -1
                  };
                  if (this.state.game.current_player === 1) {
                    this.setState({
                      ...this.state,
                      player_2: enemy,
                      game: game
                    });
                  } else {
                    this.setState({
                      ...this.state,
                      player_1: enemy,
                      game: game
                    });
                  }

                } else {
                  alert('No position selected for attack!');
                }

              }}>Attack</button>
            </>
        );
      }
      else if (this.state.game.step === 'end_turn') {
        return (
            <>
              <button className='button'
                  onClick={() => {
                const game = this.state.game;
                const attacked_enemy_ships = this.getEnemy().sea_map.flat().filter(i => i.has_ship && i.is_attacked).length;

                if (attacked_enemy_ships === SHIP_COUNT) {
                  this.setState({
                    ...this.state,
                    step: 'announcement'
                  });
                } else {
                  game.step = 'start_turn';
                  game.message= '';

                  if (this.state.game.current_player === 1) {
                    game.current_player = 2;
                  } else {
                    game.current_player = 1;
                  }

                  this.setState({
                    ...this.state,
                    game: game
                  });
                }

              }}>End turn</button>
            </>
        );
      }
    }
  }

  renderDescription(){
    if (this.state.step !== 'game' || (this.state.game.step !== 'move' && this.state.game.step !== 'end_turn'))
      return null;
    return  <p className='text4'>
      <label>Description:</label> <br />
      <span style={{color:'red'}}>Red square</span> - Attacked enemy ship <br />
      <span style={{color:'orange'}}>Orange square</span> - Attacked position without ship <br />
      <span style={{color:'green'}}>Green square</span> - Selected position to attack <br />
      <span style={{color:'blue'}}>Blue square</span> - My ships <br />
    </p>
  }

  getCurrentPlayer() {
    const current = this.state.game.current_player === 1 ? this.state.player_1 : this.state.player_2;
    return current;
  }

  getEnemy() {
    const enemy = this.state.game.current_player === 1 ? this.state.player_2 : this.state.player_1;
    return enemy;
  }

  renderHeader() {
    if (this.state.step === 'arrangement') {
      return (
          <>
            <div>
              <label className='text'>Arrangement of ships for Player {this.state.game.current_player}</label>
            </div>
            <div className='text2'>
              Enter your name
              <input placeholder="Your name.."
                  value={this.state.player_name_input}
                     onChange={(e) => {
                       this.setState({...this.state, player_name_input: e.target.value});
                     }}
              />
            </div>
          </>
      );
    }
    else if (this.state.step === 'game') {
      const current_player = this.getCurrentPlayer();
      return (
          <>
            <div>
              <label className='text'>Current player (Player {this.state.game.current_player}): {current_player.name}</label>
            </div>
            <div>
              <label className='text2' style={{color: 'red'}}> {this.state.game.message}</label>
            </div>
          </>
      )
    }
    else if (this.state.step === 'announcement') {
      const winner = this.getCurrentPlayer();
      return (
          <>
            <div>
              <label className='text'>Game is over! Winner is - {winner.name} (Player {this.state.game.current_player})</label>
            </div>
          </>
      )
    }
  }

  render() {
    return (
        <div className='main'>
          <div>
            <button className='button-newGame'
                value={'New game'} onClick={() => {
              this.setState(initialState());
            }} >New game</button>
          </div>
          <div>
            {this.renderHeader()}
          </div>
          <div className='row'>
            {this.renderMyFleet()}
            <div className='margin2'>

            </div>
            {this.renderEnemyFleet()}
          </div>
          <div>
            {this.renderDescription()}
          </div>
          <div>
            {this.renderBottomButtons()}
          </div>


          <br />
        </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
