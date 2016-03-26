﻿var player =
{
    init: function (elevators, floors) {
        
        var hookUpAllEvents = function () {
            var elevatorIndex = -1;

            var executeElevatorCommands = function (elevatorCommands) {
                var goToFloors = elevatorCommands.GoToFloor;
                if (typeof goToFloors !== "undefined") {
                    goToFloors.forEach(function (parameters) {
                        console.debug("Elevator " + parameters.ElevatorIndex + " go to floor " + parameters.FloorNumber);
                        elevators[parameters.ElevatorIndex].goToFloor(parameters.FloorNumber, parameters.JumpQueue);
                    });
                }
            };

            elevators.forEach(function (elevator) {
                
                elevatorIndex++;
                console.debug("ElevatorIndex " + elevatorIndex);

                var elevatorDto = {
                    ElevatorIndex: elevatorIndex,
                    DestinationQueue: elevator.destinationQueue,
                    CurrentFloor: elevator.currentFloor,
                    GoingUpIndicator: elevator.goingUpIndicator,
                    GoingDownIndicator: elevator.goingDownIndicator,
                    MaxPassengerCount: elevator.maxPassengerCount,
                    LoadFactor: elevator.loadFactor,
                    DestinationDirection: elevator.destinationDirection,
                    PressedFloors: elevator.getPressedFloors
                }

                // Idle
                elevator.on("idle", function () {
                    console.debug("Elevator " + elevatorIndex + " is idle.");
                    $.ajax({
                        data: elevatorDto,
                        url: "/elevator/idle",
                        success: executeElevatorCommands
                    });
                });

                // Floor Button Pressed
                elevator.on("floor_button_pressed", function (floorNum) {
                    console.debug("Elevator " + elevatorIndex + " floor button pressed.");
                    elevatorDto.FloorNumberPressed = floorNum;
                    $.ajax({
                        data: elevatorDto,
                        url: "/elevator/floorButtonPressed",
                        success: executeElevatorCommands
                    });
                });

                // Passing Floor
                elevator.on("passing_floor", function (floorNum, direction) {
                    console.debug("Elevator " + elevatorIndex + " passing floor " + floorNum + " going " + direction + ".");
                    elevatorDto.FloorNumberPressed = floorNum;
                    elevatorDto.Direction = direction;
                    $.ajax({
                        data: elevatorDto,
                        url: "/elevator/passingFloor",
                        success: executeElevatorCommands
                    });
                });

                // Stopped At Floor
                elevator.on("stopped_at_floor", function (floorNum) {
                    console.debug("Elevator " + elevatorIndex + " stopped at floor " + floorNum);
                    elevatorDto.StoppedAtFloorNumber = floorNum;
                    $.ajax({
                        data: elevatorDto,
                        url: "/elevator/stoppedAtFloor",
                        success: executeElevatorCommands
                    });
                });
            });

            floors.forEach(function (floor) {
                floor.on("up_button_pressed", function () {
                    console.debug("Up button pressed on floor " + floor.floorNum());
                    $.ajax({
                        data: {
                            FloorNumber: floor.floorNum() 
                        },
                        url: "/floor/upButtonPressed",
                        success: function (elevatorCommands) {
                            var goToFloors = elevatorCommands.GoToFloor; 
                            goToFloors.forEach(function (parameters) {
                                console.debug("Elevator " + parameters.ElevatorIndex + " go to floor " + parameters.FloorNumber);
                                elevators[parameters.ElevatorIndex].goToFloor(parameters.FloorNumber, parameters.JumpQueue);
                            });
                            console.debug(elevatorCommands);
                        }
                    });
                });

                floor.on("down_button_pressed", function () {
                    console.debug("Down button pressed on floor " + floor.floorNum());
                    $.ajax({
                        data: {
                            FloorNumber: floor.floorNum()
                        },
                        url: "/floor/downButtonPressed",
                        success: function (elevatorCommands) {
                            var goToFloors = elevatorCommands.GoToFloor;
                            goToFloors.forEach(function (parameters) {
                                console.debug("Elevator " + parameters.ElevatorIndex + " go to floor " + parameters.FloorNumber);
                                elevators[parameters.ElevatorIndex].goToFloor(parameters.FloorNumber, parameters.JumpQueue);
                            });
                            console.debug(elevatorCommands);
                        }
                    });
                });
            });
        };

        // First thing to do is to create our Skyscraper in C# passing elevators and floors from here, because each challenge has new config
        // But, we only need a subset of properties to create the skyscraper. We don't need currentFloor, floorNumberPressed etc.
        var elevatorDtos = [];
        for (var i = 0; i < elevators.length; i++) {
            elevatorDtos[i] = {
                ElevatorIndex: i,
                MaxPassengerCount: elevators[i].maxPassengerCount,
                LoadFactor: elevators[i].loadFactor
            }
        }

        var floorDtos = [];
        for (var j = 0; j < floors.length; j++) {
            floorDtos[j] = {
                FloorNumber: floors[j].floorNum
            }
        }

        $.ajax({
            data: {
                elevators: elevatorDtos,
                floors: floorDtos
            },
            url: "/skyscraper/new",
            success: hookUpAllEvents
        });
    },
    update: function (dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}