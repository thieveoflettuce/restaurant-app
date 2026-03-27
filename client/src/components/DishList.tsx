import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Dish {
    id: number;
    name: string;
    price: string;
}

const DishList: React.FC = () => {
    const [dishes, setDishes] = useState<Dish[]>([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/dishes')
            .then(response => setDishes(response.data))
            .catch(error => console.error(error));
    }, []);

    return (
        <div>
            <h1>Меню</h1>
            <ul>
                {dishes.map(dish => (
                    <li key={dish.id}>
                        {dish.name} - {dish.price} ₽
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DishList;