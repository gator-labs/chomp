import numpy as np

question_cost = 5000

def get_exponent(_second_order_estimates, second_order_estimated):
    # the first value passed here differs from the function below: it is the full list of estimates
    # we want the exponent to target a specific width of rewarded answers (~60% of estimates should be rewarded). 
    distances = []  # make a list of the absolute values of all the 2nd order distances
    for i in range(len(_second_order_estimates)):
        distances.append(abs((second_order_estimated - _second_order_estimates[i])))                   
    
    distances.sort() # sort the list by distance               
    greatest_distance = distances[int(np.round(len(_second_order_estimates)*.6))] # get the greatest distance, which corresponds to the distance estimate of the rewardee who was furthest from the obtained estimator within the 60th percentile

    # calculate the exponent
    return 2*np.log(10)/np.log(greatest_distance)

def get_chomp_rewards(first_order_choice, first_order_actual, second_order_estimate, second_order_estimated, _second_order_estimates):
    # first_order_choice is the user's answer in boolean
    # first_order_actual is the actual answer in boolean
    # second_order_estimate is the user's estimation of the 2nd order probability (what % do you think answer True to this question)
    # second_order_estimated is the actual % of users who say the answer is True or False
    global exponent, question_cost
    
    d = abs(second_order_estimated - second_order_estimate)
    #print('d:', d)
    d_raised = (d**(get_exponent(_second_order_estimates, second_order_estimated)))/100
    #print('d_raised: ',d_raised)

    if first_order_choice == first_order_actual:
        if d_raised < 1: 
            return question_cost*(2-d_raised)
        else:
            return question_cost
    else:
        return 0