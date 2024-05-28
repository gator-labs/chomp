import numpy as np

def get_PMBA_answer(list_of_lists):
    # pass in a list of lists. each sub-list is the 2nd order estimations for a given answer
    # index 0 of the list of lists (i.e. list 1) is for answer A, 1 for B, and so on...
    lengths = []
    for i in list_of_lists:
        lengths.append(len(i))
        
    first_orders = []
    for i in lengths:
        first_orders.append(i/sum(lengths))
        
    second_orders = []
    for i in list_of_lists:
        second_orders.append(sum(i)/len(i))
        
    _first_orders = np.array(first_orders)
    inverse_first_orders = []
    for i in first_orders:
        inverse_first_orders.append(1-i)
    _first_orders = np.array([first_orders, inverse_first_orders])
    bars = np.dot(np.linalg_inv(_first_orders),second_orders)
    
    distances = []
    for i in range(len(bars)):
        distances.append(first_orders[i] - bars[i])

    return distances.index(min(distances)) # returns the index that corresponds to the answer (0 for A, 1 for B, 2 for C...)




def get_SP_answer_binary(first_order_percent_A, first_order_percent_B, second_order_percent_A, second_order_percent_B):
    
    a = first_order_percent_A - second_order_percent_A
    b = first_order_percent_B - second_order_percent_B
    
    if a > b:
        answer = 'A'
    elif b > a:
        answer = 'B'
    else:
        answer = 'Tie'
    
    return answer