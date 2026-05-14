import React, { useEffect, useState } from 'react';
import api from '../api';

interface Dish {
    id: number;
    name: string;
    price: number | string;
}

const DishList: React.FC = () => {
    const [dishes, setDishes] = useState<Dish[]>([]);

    useEffect(() => {
        api.get('/api/dishes')
            .then(response => setDishes(response.data))
            .catch(error => console.error(error));
    }, []);

    return (
        <div>
            <h1>Меню</h1>
            <ul>
                {dishes.map(dish => (
                    <li key={dish.id}>
                        {dish.name} -{' '}
                        {new Intl.NumberFormat('ru-BY', { style: 'currency', currency: 'BYN' }).format(
                            Number(dish.price)
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DishList;