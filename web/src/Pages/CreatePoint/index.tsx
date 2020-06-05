import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';

import API from '../../Services/API';

import Logo from '../../Assets/Logo.svg';
import './styles.css';

interface Item {
    id: number,
    title: string,
    image_url: string
}

interface IBGEUFResponse {
    sigla: string
}

interface IBGECityResponse {
    nome: string
}

const CreatePoint = () => {
    const [itens, setItens] = useState<Item[]>([]);
    const [ufs, setUFs] = useState<string[]>([]);
    const [nameCitys, setNameCitys] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })

    const [selectUf, setSelectUF] = useState('');
    const [selectCity, setSelectCity] = useState('');
    const [selectPosition, setSelectPosition] = useState<[number, number]>([0, 0]);
    const [selectItens, setSelectItens] = useState<number[]>([]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

    const history = useHistory();

    useEffect(() => {
        API.get('itens').then(response => {
            setItens(response.data)
        });
    }, []);

    useEffect(() => {
        axios
            .get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
            .then(response => {
                setUFs(response.data.map(uf => uf.sigla))
            })
    }, [])

    useEffect(() => {
        if (selectUf === '0') {
            return;
        }
        axios
            .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectUf}/distritos`)
            .then(response => {
                setNameCitys(response.data.map(city => city.nome))
            })
    }, [selectUf])

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            setInitialPosition([position.coords.latitude, position.coords.longitude])
        })
    }, [])

    function handleselectUf(event: ChangeEvent<HTMLSelectElement>) {
        setSelectUF(event.target.value);
    }

    function handleselectCity(event: ChangeEvent<HTMLSelectElement>) {
        setSelectCity(event.target.value);
    }

    function handleMapClick(event: LeafletMouseEvent) {
        setSelectPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        setFormData({ ...formData, [event.target.name]: event.target.value })
    }

    function handleSelectItem(id: number) {
        const alreadySelected = selectItens.findIndex(item => item === id);

        if (alreadySelected >= 0) {
            const filteredItens = selectItens.filter(item => item !== id);

            setSelectItens(filteredItens);
        }
        else {
            setSelectItens([...selectItens, id]);
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const { name, email, whatsapp } = formData;
        const uf = selectUf;
        const city = selectCity;
        const [latitude, longitude] = selectPosition;
        const itens = selectItens;

        const data = {
            name, email, whatsapp,
            uf, city, latitude, longitude, itens
        }

        await API.post('points', data);

        alert('Ponto de Coleta Criado');

        history.push('/');
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={Logo} alt="Ecoleta" />

                <Link to="/"><FiArrowLeft />Voltar para Home</Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br /> Ponto de Coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da Entidade</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o Endereço no Mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onclick={handleMapClick}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select
                                name="uf"
                                id="uf"
                                value={selectUf}
                                onChange={handleselectUf}
                            >
                                <option hidden> Selecione uma UF </option>
                                {
                                    ufs.map(uf => (
                                        <option key={uf} value={uf}>{uf}</option>
                                    ))
                                }
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select
                                name="city"
                                id="city"
                                onChange={handleselectCity}
                                value={selectCity}
                            >
                                <option hidden> Selecione uma Cidade </option>
                                {
                                    nameCitys.map(citys => (
                                        <option key={citys} value={citys}>{citys}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de Coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="itens-grid">
                        {itens.map((item) => (
                            <li
                                key={item.id}
                                onClick={() => handleSelectItem(item.id)}
                                className={selectItens.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.image_url} alt={item.title} />
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                <button type="submit">Cadastrar Ponto de Coleta</button>
            </form>
        </div>
    )
}

export default CreatePoint;