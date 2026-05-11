export function ProfessionalTable({ data }) {
    return (
        <div className="table-container">
            <h3>Top Profesionales</h3>
            <table className="professional-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Total Citas</th>
                        <th>Completadas</th>
                        <th>Eficiencia</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((prof, index) => {
                        const efficiency = 
                        prof.total > 0 
                        ? Math.round((prof.completed / prof.total) * 100) 
                        : 0;

                        return (
                            <tr key={prof.id}>
                                <td>{index + 1}</td>
                                <td>{prof.name}</td>
                                <td>{prof.total}</td>
                                <td>{prof.completed}</td>
                                <td>
                                    <div className="efficiency-bar">
                                        <div className="efficiency-fill" style={{ width: `${efficiency}%`,
                                        background: efficiency > 80 ? "#22c55e" : "#f59e0b", }}
                                        />
                                        <span>{efficiency}%</span>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    )
}