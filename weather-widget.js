const API = '/cities.json';
const OPENWEATHERMAP = 'https://api.openweathermap.org/data/2.5/weather?q=';

class LocationRow extends React.Component {
    render() {
        return (
            <tr className="city-row" ref="this.props.location.city" onClick={this.props.getWeatherJson}>
                <td>{this.props.location.number}</td>
                <td className="city-name">{this.props.location.city}</td>
                <td>{this.props.location.country} <div className="remove-icon" onClick={this.props.deleteCityRow}>Х</div></td>
            </tr>
        );
    }
}

class SearchBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            cities: [],
            cityName: '',
            weather: {"coord":{"lon":'',"lat":''},"weather":[{"id":'',"main":"","description":"","icon":""}],"base":"stations","main":{"temp":'',"pressure":'',"humidity":'',"temp_min":'',"temp_max":''},"visibility":'',"wind":{"speed":'',"deg":''},"clouds":{"all":''},"dt":'',"sys":{"type":'',"id":'',"message":'',"country":"","sunrise":'',"sunset":''},"id":'',"name":"","cod":''}
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.clearField = this.clearField.bind(this);
        this.getWeatherJson = this.getWeatherJson.bind(this);
        this.addCity = this.addCity.bind(this);
    }

    handleChange(event) {
            this.setState({cityName: event.target.value});
    }

    handleKeyUp(event) {
        if (event.key == "Enter") {
            event.preventDefault();
            this.addCity();
        } else {
            this.setState({cityName: event.target.value});
        }
    }

   componentDidMount() {
        fetch(API)
            .then(response => response.json())
            .then(data => this.setState({cities: data}));

    }

    addCity() {
        this.state.cityName = document.getElementById('cityName').value;
        if (this.state.cityName !== '' && LOCATIONS.find(city => city.city == this.state.cityName) === undefined) {
            var validLocation = this.state.cities.find(city => city.name === this.state.cityName);
            if (typeof validLocation !== 'undefined') {
                LOCATIONS.push({
                    number: LOCATIONS.length + 1,
                    city: validLocation.name,
                    country: validLocation.country
                });
                this.getWeatherJson(validLocation.name);
            }
        }
        document.getElementById('cityName').value = '';
        ReactDOM.render(
            <FilterableLocationTable locations={LOCATIONS}/>,
            document.getElementById('container')
        );

    }

    removeActiveRow(){
        var cityRows = (document.querySelectorAll('.city-row'));
        for (var i = 0; i < cityRows.length; i++){
            if (cityRows[i].classList.contains("active-row")){
                cityRows[i].classList.remove("active-row");
                return true
            }
        }
        return true;
    }

    getWeatherJson(city) {
        if (typeof(city) !== 'string') {
            if(this.removeActiveRow()){
                city.target.closest('.city-row').classList.add('active-row');
            }
            city = city.target.closest('.city-row').querySelector('.city-name').innerHTML;
        }
        fetch(OPENWEATHERMAP + city + '&appid=ab27d2aadc0f3849051be299e8c89b6b&units=imperial')
            .then(response => response.json())
            .then(data => this.setState({weather: data}));
    }

    clearField() {
        this.state.cityName = '';
        ReactDOM.render(

            <FilterableLocationTable locations={LOCATIONS}/>,
            document.getElementById('container')
        );
    }

    deleteCityRow(event){
        event.target.closest('tr').remove();
    }

    buildRow() {
        var rows = [];
        for (var i = 0; i < this.props.locations.length; i++ ){
        rows.push(<LocationRow getWeatherJson={this.getWeatherJson} deleteCityRow={this.deleteCityRow} location={this.props.locations[i]} key={this.props.locations[i].city}/>);
        }
        return rows;
    }


    render() {
        var rows = this.buildRow(this);
        return (
            <div>
                <form className="city-inputs">
                    <div className="form-group row">
                        <label htmlFor="cityName" className="col-2 col-form-label">City</label>
                        <div className="col-lg-6 col-sm-10">
                            <App />
                        </div>
                        <div className="buttons-block col-lg-4">
                            <button type="button" className="btn btn-info" onClick={this.addCity}>Add city</button>
                            <button type="button" className="btn btn-danger" onClick={this.clearField}>Clear field
                            </button>
                        </div>
                    </div>
                </form>
                <div className="table-block">
                    <table className="table table-hover table-city-name">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>City</th>
                            <th>Country</th>
                        </tr>
                        </thead>
                        <tbody>{rows}</tbody>
                    </table>
                </div>
                <div className="container weather-block">
                    <div className="temperature">
                        <span>{this.state.weather.main.temp + '°F'}</span>
                    </div>
                    <div className="wind">
                        {'Wind: ' + this.state.weather.wind.speed + ' m/s'}
                    </div>
                    <div className="weather-description">
                        {this.state.weather.weather[0].description}
                    </div>
                </div>
            </div>
        );
    }


}

class FilterableLocationTable extends React.Component {
    render() {
        return (
            <div>
                <SearchBar locations={this.props.locations}/>
            </div>
        );
    }
}

const allCities = [];
    fetch(API)
    .then(response => response.json())
    .then(data => allCities.push(data));


function escapeRegexCharacters(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSuggestions(value) {
    const escapedValue = escapeRegexCharacters(value.trim());

    if (escapedValue === '') {
        return [];
    }

    const regex = new RegExp('^' + escapedValue, 'i');
    return allCities[0].filter(city => regex.test(city.name));
}

function getSuggestionValue(suggestion) {
    return suggestion.name;
}

function renderSuggestion(suggestion) {
    return (
        <span>{suggestion.name}</span>
    );
}

class App extends React.Component {
    constructor() {
        super();

        this.state = {
            value: '',
            suggestions: []
        };
    }

    onChange = (event, { newValue, method }) => {
        this.setState({
            value: newValue
        });
    };

    onSuggestionsFetchRequested = ({ value }) => {
        this.setState({
            suggestions: getSuggestions(value)
        });
    };

    onSuggestionsClearRequested = () => {
        this.setState({
            suggestions: []
        });
    };

    render() {
        const { value, suggestions } = this.state;
        const inputProps = {
            value,
            className:"form-control",
            id:"cityName" ,
            placeholder:"Enter your city",
            onChange: this.onChange
        };
        return (
            <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                inputProps={inputProps} />
        );
    }
}

var LOCATIONS = [
    {number: 1, city: 'London', country: 'GB'},
    {number: 2, city: 'Toronto', country: 'CA'}
];

ReactDOM.render(
    <FilterableLocationTable locations={LOCATIONS}/>,
    document.getElementById('container')
);
