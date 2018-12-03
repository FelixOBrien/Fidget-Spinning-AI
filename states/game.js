var Game = {};
var spinners= []
var network, timer, winners, generation = 1, fastest = 0, fastestGen; 
const urlParams = new URLSearchParams(window.location.search);
var speed = urlParams.get('speed');
if(speed){
    
}else{
    speed = 1000;
}
Game.preload = function(){
    
    this.game.load.image("spinner", "fidget.jpg");
    
};
Game.create = function(){
    
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.stage.backgroundColor = '#add8e6';
        for(var i =0; i < 10; i++){
         spinners[i] = this.game.add.sprite(50 + i*125, 50, "spinner");
         spinners[i].anchor.setTo(0.5)
         spinners[i].scale.setTo(0.1);
         spinners[i].network = new synaptic.Architect.Perceptron(1, 6, 1);
         spinners[i].score = 0;
         spinners[i].fitness = 0;
         spinners[i].index = i;
         this.game.physics.enable(spinners[i], Phaser.Physics.ARCADE);
        }
         
         

        timer = game.time.create(false);

        //  Set a TimerEvent to occur after 2 seconds
        timer.loop(speed, Game.evolve, this);
    
        //  Start the timer running - this is important!
        //  It won't start automatically, allowing you to hook it to button events and the like.
        timer.start();
    };
Game.update = function(){
    
    for(var i = 0; i < spinners.length; i++){
        spinners[i].fitness += spinners[i].body.angularVelocity/100
        
        var inputs = [spinners[i].body.angularVelocity];
		
		// calculate outputs by activating synaptic neural network of this bird
		var outputs = spinners[i].network.activate(inputs);
			
		spinners[i].body.angularVelocity= outputs[0]*1000;
		
       
    }
    
    
};
Game.evolve = function(){

    
    var Winners = Game.select();
    generation += 1;
    document.getElementById("generation").innerHTML = "Generation: " + generation;
    for(var i = 0; i< 10; i++){
        
        if(spinners[i].fitness > fastest){
            fastest = spinners[i].fitness;
            console.log(fastest);
            fastestGen = generation;
            document.getElementById("fastest").innerHTML = "Fastest Generation: " + fastestGen;
            spinners[i].fitness = 0;
            
        }
    }
        for (var i=2; i<10; i++){
            
			var parentA, parentB, offspring;
				
			if (i == 2){
				// offspring is made by a crossover of two best winners
				parentA = Winners[0].network.toJSON();
				parentB = Winners[1].network.toJSON();
				offspring = Game.crossOver(parentA, parentB);

			} else if (i < 8){
				// offspring is made by a crossover of two random winners
				parentA = Game.getRandomUnit(Winners).network.toJSON();
				parentB = Game.getRandomUnit(Winners).network.toJSON();
				offspring = Game.crossOver(parentA, parentB);
				
			} else {
				// offspring is a random winner
				offspring = Game.getRandomUnit(Winners).network.toJSON();
            }
            offspring = Game.mutation(offspring);
            spinners[i].network = synaptic.Network.fromJSON(offspring);
			//newUnit.index = spinners[i].index;
			spinners[i].fitness = 0;
			spinners[i].score = 0;
           

			
        }
};

Game.crossOver = function(parentA, parentB){
    var cutPoint = Game.random(0, parentA.neurons.length-1);
		
		// swap 'bias' information between both parents:
		// 1. left side to the crossover point is copied from one parent
		// 2. right side after the crossover point is copied from the second parent
		for (var i = cutPoint; i < parentA.neurons.length; i++){
			var biasFromParentA = parentA.neurons[i]['bias'];
			parentA.neurons[i]['bias'] = parentB.neurons[i]['bias'];
			parentB.neurons[i]['bias'] = biasFromParentA;
		}

		return Game.random(0, 1) == 1 ? parentA : parentB;

};
Game.mutation = function(offspring){
    for (var i = 0; i < offspring.neurons.length; i++){
        offspring.neurons[i]['bias'] = Game.mutate(offspring.neurons[i]['bias']);
    }
    
    // mutate some 'weights' information of the offspring connections
    for (var i = 0; i < offspring.connections.length; i++){
        offspring.connections[i]['weight'] = Game.mutate(offspring.connections[i]['weight']);
    }
    
    return offspring;
};
Game.mutate = function(gene){
    if (Math.random() < 1) {
        var mutateFactor = 1 + ((Math.random() - 0.5) * 3 + (Math.random() - 0.5));
        gene *= mutateFactor;
    }
    
    return gene;
};
Game.getRandomUnit = function(array){
    return array[Game.random(0, array.length-1)];
};
Game.select = function(){
    var winners = spinners.sort(
        function(unitA, unitB){
            return unitB.fitness - unitA.fitness;
        }
    );
    return winners.slice(0,2);

};
Game.random = function(min,max){
    return Math.floor(Math.random()*(max-min+1) + min);
};